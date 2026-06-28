// lib/services/dashboard.service.ts
//
// Thin orchestrator for dashboard operations.
// Route handlers call this — they never touch the store directly.

import { getContainer } from "@/lib/container";
import type {
  DashboardListOptions,
  DashboardListResult,
} from "@/lib/interfaces/i-dashboard-store";

export async function listAudits(
  options: DashboardListOptions,
): Promise<DashboardListResult> {
  const { dashboardStore } = getContainer();
  return dashboardStore.list(options);
}

export async function deleteAudit(auditId: string): Promise<void> {
  const { dashboardStore } = getContainer();
  return dashboardStore.deleteAudit(auditId);
}
