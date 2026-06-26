// lib/services/share.service.ts
//
// Owns public share token resolution.
// Step 8.2 changes vs Step 8.1:
//   - No longer imports mock store or builders directly.
//   - Delegates to ShareRepository with container-injected deps.

import type { ShareReportResponse } from "@/lib/types/audit-api";
import { getContainer } from "@/lib/container";
import { ShareRepository } from "@/lib/repositories/share.repository";

export async function getSharedReport(
  shareToken: string,
): Promise<ShareReportResponse> {
  const container = getContainer();
  const repo = new ShareRepository(container.auditStore, container.auditEngine);
  return repo.getSharedReport(shareToken);
}