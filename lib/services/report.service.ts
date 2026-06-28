// lib/services/report.service.ts
//
// Step 8.6 change: passes container.reportStore to ReportRepository.
// The method signature is identical — callers (route handler) unchanged.

import type { AuditReportResponse } from "@/lib/types/audit-api";
import { getContainer } from "@/lib/container";
import { ReportRepository } from "@/lib/repositories/report.repository";

export async function getAuditReport(
  auditId: string,
): Promise<AuditReportResponse> {
  const container = getContainer();
  const repo = new ReportRepository(
    container.auditStore,
    container.auditEngine,
    container.reportStore,
  );
  return repo.getReport(auditId);
}
