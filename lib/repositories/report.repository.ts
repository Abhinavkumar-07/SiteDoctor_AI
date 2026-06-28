// lib/repositories/report.repository.ts
//
// Step 8.6 changes vs Step 8.4:
//   - Receives IReportStore as a constructor dependency.
//   - getReport() checks the store first.
//   - On cache miss: builds with engine, then persists before returning.
//   - No change to the method signature — callers (report.service.ts) unchanged.

import type { IAuditStore } from "@/lib/interfaces/i-audit-store";
import type { IAuditEngine } from "@/lib/interfaces/i-audit-engine";
import type { IReportStore } from "@/lib/interfaces/i-report-store";
import type { AuditReportResponse } from "@/lib/types/audit-api";
import { Errors } from "@/lib/types/api-errors";

export class ReportRepository {
  constructor(
    private readonly store: IAuditStore,
    private readonly engine: IAuditEngine,
    private readonly reportStore: IReportStore,
  ) {}

  async getReport(auditId: string): Promise<AuditReportResponse> {
    // ── 1. Verify audit exists ────────────────────────────────────────────────
    const record = await this.store.findById(auditId);
    if (!record) throw Errors.notFound(`Report for audit ${auditId}`);

    // ── 2. Check completion gate ──────────────────────────────────────────────
    const status = this.engine.getStatus(
      record.auditId,
      record.url,
      record.createdAt,
    );
    if (status.status !== "completed") {
      throw Errors.notFound(`Report for audit ${auditId} is not ready yet`);
    }

    // ── 3. Try persisted report first (Supabase cache) ────────────────────────
    const persisted = await this.reportStore.findByAuditId(auditId);
    if (persisted) return persisted;

    // ── 4. Cache miss — build report via engine ───────────────────────────────
    const report = await this.engine.buildReport(
      record.auditId,
      record.url,
      record.createdAt,
    );

    // ── 5. Persist asynchronously (non-blocking) ─────────────────────────────
    // We do not await — the caller gets the response immediately.
    // A failed persist is logged but does not surface as an error to the user.
    this.reportStore.save(report).catch((err) => {
      console.error(
        `[ReportRepository] Background persist failed for ${auditId}:`,
        err,
      );
    });

    return report;
  }
}
