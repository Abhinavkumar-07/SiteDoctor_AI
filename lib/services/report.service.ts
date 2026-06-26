// lib/services/report.service.ts
//
// Owns report retrieval.
// Step 8.2 changes vs Step 8.1:
//   - No longer calls buildMockStatus/buildMockReport directly.
//   - Delegates entirely to ReportRepository, which itself depends on
//     IAuditStore and IAuditEngine — both resolved via container.

import type { AuditReportResponse } from "@/lib/types/audit-api";
import { getContainer } from "@/lib/container";
import { ReportRepository } from "@/lib/repositories/report.repository";

export async function getAuditReport(
  auditId: string,
): Promise<AuditReportResponse> {
  const container = getContainer();

  console.log("===== REPORT SERVICE =====");
  console.log("container =", container);
  console.log("auditStore =", container.auditStore);
  console.log("auditEngine =", container.auditEngine);

  const repo = new ReportRepository(
    container.auditStore,
    container.auditEngine,
  );

  console.log("repo =", repo);

  return repo.getReport(auditId);
}