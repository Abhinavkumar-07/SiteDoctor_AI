// lib/repositories/share.repository.ts
//
// Repository for share token resolution.
// Looks up the audit record by token, gates on completion, returns the
// full share response.
// In Step 8.3+: token lookup queries a `share_links` table in Supabase.

import type { IAuditStore } from "@/lib/interfaces/i-audit-store";
import type { IAuditEngine } from "@/lib/interfaces/i-audit-engine";
import type { ShareReportResponse } from "@/lib/types/audit-api";
import { shareTokenToAuditId } from "@/lib/utils/id";
import { Errors } from "@/lib/types/api-errors";

export class ShareRepository {
  constructor(
    private readonly store: IAuditStore,
    private readonly engine: IAuditEngine,
  ) {}

  async getSharedReport(shareToken: string): Promise<ShareReportResponse> {
    // Try direct store lookup first (token stored on creation)
    let record = await this.store.findByShareToken(shareToken);

    // Fallback: decode base64url token → auditId
    if (!record) {
      const auditId = shareTokenToAuditId(shareToken);
      if (auditId) {
        record = await this.store.findById(auditId);
      }
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

    const report = await this.engine.buildReport(
      record.auditId,
      record.url,
      record.createdAt,
    );

    return {
      ...report,
      shareToken,
      isExpired: false,
      sharedAt: report.completedAt,
    };
  }
}
