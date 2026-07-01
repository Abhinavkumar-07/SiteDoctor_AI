// lib/services/audit-events.service.ts
//
// Thin service for the GET /api/v1/audits/:auditId/events endpoint.
// Verifies the audit exists before returning events (consistent 404 behaviour).

import { getContainer } from "@/lib/container";
import { Errors } from "@/lib/types/api-errors";
import type { AuditEvent } from "@/lib/interfaces/i-audit-event-store";

export async function getAuditEvents(auditId: string): Promise<AuditEvent[]> {
  const { auditStore, auditEventStore } = getContainer();

  // Return 404 if the audit does not exist at all
  const record = await auditStore.findById(auditId);
  if (!record) throw Errors.notFound(`Audit ${auditId}`);

  return auditEventStore.listByAuditId(auditId);
}
