// lib/services/share.service.ts
//
// Owns public share token resolution.
// Decodes the share token back to an auditId, then builds the share response.
//
// Migration note: In Step 8.2+ this queries a `share_links` table in Supabase
// instead of decoding from base64url.

import { auditStore } from "@/lib/mock/mock-audit-store";
import { buildMockReport } from "@/lib/mock/mock-report";
import { buildMockShare } from "@/lib/mock/mock-share";
import { buildMockStatus } from "@/lib/mock/mock-status";
import { shareTokenToAuditId } from "@/lib/utils/id";
import { Errors } from "@/lib/types/api-errors";
import type { ShareReportResponse } from "@/lib/types/audit-api";

export async function getSharedReport(
  shareToken: string,
): Promise<ShareReportResponse> {
  // Attempt to decode token → auditId
  const auditId = shareTokenToAuditId(shareToken);

  // Also try direct lookup (for tokens stored in the in-process store)
  const recordByToken = auditStore.findByShareToken(shareToken);
  const record = recordByToken ?? (auditId ? auditStore.get(auditId) : undefined);

  if (!record) {
    throw Errors.notFound("Share link");
  }

  // Gate: only serve if processing complete
  const status = buildMockStatus(record.auditId, record.url, record.createdAt);
  if (status.status !== "completed") {
    throw Errors.notFound("Shared report is not ready yet");
  }

  const report = buildMockReport(record.auditId, record.url, record.createdAt);
  return buildMockShare(report, shareToken);
}
