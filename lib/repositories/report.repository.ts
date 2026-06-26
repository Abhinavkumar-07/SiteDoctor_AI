// lib/repositories/report.repository.ts
//
// Repository for report retrieval.
// In Step 8.1–8.2: delegates to IAuditEngine.buildReport (mock data).
// In Step 8.3+: queries a Supabase `audit_results` table instead.
// The service layer calls this — it never imports IAuditEngine directly.

import type { IAuditStore } from "@/lib/interfaces/i-audit-store";
import type { IAuditEngine } from "@/lib/interfaces/i-audit-engine";
import type { AuditReportResponse } from "@/lib/types/audit-api";
import { Errors } from "@/lib/types/api-errors";

export class ReportRepository {
  constructor(
    private readonly store: IAuditStore,
    private readonly engine: IAuditEngine,
  ) {}

  async getReport(auditId: string): Promise<AuditReportResponse> {
    const record = await this.store.findById(auditId);

    if (!record) {
      throw Errors.notFound(`Report for audit ${auditId}`);
    }

    const status = this.engine.getStatus(
      record.auditId,
      record.url,
      record.createdAt,
    );

    if (status.status !== "completed") {
      throw Errors.notFound(`Report for audit ${auditId} is not ready yet`);
    }

    return this.engine.buildReport(
      record.auditId,
      record.url,
      record.createdAt,
    );
  }
}

