// lib/services/share.service.ts
//
// Step 8.6 change: passes container.reportStore to ShareRepository.

import type { ShareReportResponse } from "@/lib/types/audit-api";
import { getContainer } from "@/lib/container";
import { ShareRepository } from "@/lib/repositories/share.repository";

export async function getSharedReport(
  shareToken: string,
): Promise<ShareReportResponse> {
  const container = getContainer();
  const repo = new ShareRepository(
    container.auditStore,
    container.auditEngine,
    container.reportStore,
  );
  return repo.getSharedReport(shareToken);
}
