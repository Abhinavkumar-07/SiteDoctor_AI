// lib/services/report.service.ts
//
// Owns report retrieval.
// Only returns a report once the audit has completed (elapsed >= 19 s).
// Returns 404 for unknown audits and 404 for audits still in progress
// — the frontend will only navigate here after status === "completed".

import { auditStore } from "@/lib/mock/mock-audit-store";
import { buildMockStatus } from "@/lib/mock/mock-status";
import { buildMockReport } from "@/lib/mock/mock-report";
import { Errors } from "@/lib/types/api-errors";
import type { AuditReportResponse } from "@/lib/types/audit-api";

export async function getAuditReport(
  auditId: string,
): Promise<AuditReportResponse> {
  const record = auditStore.get(auditId);
  if (!record) {
    throw Errors.notFound(`Report for audit ${auditId}`);
  }

  // Gate: only serve report once processing is complete
  const status = buildMockStatus(record.auditId, record.url, record.createdAt);
  if (status.status !== "completed") {
    throw Errors.notFound(`Report for audit ${auditId} is not ready yet`);
  }

  return buildMockReport(record.auditId, record.url, record.createdAt);
}
