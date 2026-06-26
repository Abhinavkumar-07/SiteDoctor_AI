// lib/mock/mock-share.ts
//
// Wraps a mock report with the additional fields the /share endpoint returns.

import type { ShareReportResponse, AuditReportResponse } from "@/lib/types/audit-api";

export function buildMockShare(
  report: AuditReportResponse,
  shareToken: string,
): ShareReportResponse {
  return {
    ...report,
    shareToken,
    isExpired: false,
    sharedAt: report.completedAt,
  };
}
