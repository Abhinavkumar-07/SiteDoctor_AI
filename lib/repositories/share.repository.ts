// lib/repositories/share.repository.ts
//
// Step 8.6 changes vs Step 8.4:
//   - Receives IReportStore as constructor dependency.
//   - getSharedReport() checks report store before calling engine.buildReport().
//   - Method signature and return shape are unchanged.

import type { IAuditStore } from "@/lib/interfaces/i-audit-store";
import type { IAuditEngine } from "@/lib/interfaces/i-audit-engine";
import type { IReportStore } from "@/lib/interfaces/i-report-store";
import type { ShareReportResponse } from "@/lib/types/audit-api";
import { shareTokenToAuditId } from "@/lib/utils/id";
import { Errors } from "@/lib/types/api-errors";
import { getOrBuildReport } from "./in-flight-report-cache";
export class ShareRepository {
  constructor(
    private readonly store: IAuditStore,
    private readonly engine: IAuditEngine,
    private readonly reportStore: IReportStore,
  ) {}

  async getSharedReport(shareToken: string): Promise<ShareReportResponse> {
    // Resolve token → record
    let record = await this.store.findByShareToken(shareToken);
    if (!record) {
      const auditId = shareTokenToAuditId(shareToken);
      if (auditId) record = await this.store.findById(auditId);
    }
    if (!record) throw Errors.notFound("Share link");

    const status = this.engine.getStatus(
      record.auditId,
      record.url,
      record.createdAt,
    );
    if (status.status !== "completed") {
      throw Errors.notFound("Shared report is not ready yet");
    }

    // Try persisted report first
    const persisted = await this.reportStore.findByAuditId(record.auditId);
    let report = persisted;

if (!report) {

  report = await getOrBuildReport(

    record.auditId,

    async () => {

      const generated =
        await this.engine.buildReport(

          record.auditId,

          record.url,

          record.createdAt,

        );

      try {

        await this.reportStore.save(

          generated,

        );

      }

      catch (err) {

        console.error(

          `[ShareRepository] Persist failed for ${record.auditId}`,

          err,

        );

      }

      return generated;

    },

  );

}

  
    return {
      ...report,
      shareToken,
      isExpired: false,
      sharedAt: report.completedAt,
    };
  }
}
