// lib/services/audit.service.ts
//
// Owns the audit lifecycle: creation and status polling.
//
// In Step 8.2+ this file is the ONLY thing that changes when real
// infrastructure is wired in.  Route handlers never change.
//
// Current implementation: in-process mock store + time-based status.

import { auditStore } from "@/lib/mock/mock-audit-store";
import { buildMockStatus } from "@/lib/mock/mock-status";
import { generateAuditId, auditIdToShareToken } from "@/lib/utils/id";
import { Errors } from "@/lib/types/api-errors";
import type { CreateAuditResponse, AuditStatusResponse, AuditRecord } from "@/lib/types/audit-api";

// ── createAudit ───────────────────────────────────────────────────────────────

export async function createAudit(url: string): Promise<CreateAuditResponse> {
  const auditId = generateAuditId();
  const createdAt = new Date().toISOString();
  const shareToken = auditIdToShareToken(auditId);

  const record: AuditRecord = { auditId, url, createdAt, shareToken };
  auditStore.set(record);

  return {
    auditId,
    status: "queued",
    createdAt,
  };
}

// ── getAuditStatus ────────────────────────────────────────────────────────────

export async function getAuditStatus(
  auditId: string,
): Promise<AuditStatusResponse> {
  const record = auditStore.get(auditId);
  if (!record) {
    throw Errors.notFound(`Audit ${auditId}`);
  }

  return buildMockStatus(record.auditId, record.url, record.createdAt);
}
