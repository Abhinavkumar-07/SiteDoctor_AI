// lib/services/audit.service.ts
//
// Owns the audit lifecycle: creation and status polling.
//
// Step 8.2 changes vs Step 8.1:
//   - No longer imports mock data directly.
//   - createAudit() delegates to the pipeline (which validates, creates,
//     and persists via injected deps from the container).
//   - getAuditStatus() delegates to AuditRepository + IAuditEngine via
//     the container — both injected, neither imported as a concrete class.

import type { CreateAuditResponse, AuditStatusResponse } from "@/lib/types/audit-api";
import { getContainer } from "@/lib/container";
import { runCreateAuditPipeline } from "@/lib/pipeline/audit-pipeline";
import { AuditRepository } from "@/lib/repositories/audit.repository";

export async function createAudit(url: string): Promise<CreateAuditResponse> {
  const container = getContainer();
  return runCreateAuditPipeline(url, container);
}

export async function getAuditStatus(
  auditId: string,
): Promise<AuditStatusResponse> {
  const container = getContainer();
  const repo = new AuditRepository(container.auditStore);
  const record = await repo.getById(auditId); // throws 404 if missing
  return container.auditEngine.getStatus(
    record.auditId,
    record.url,
    record.createdAt,
  );
}