// lib/mock/engines/mock-dashboard-store.ts
//
// Satisfies IDashboardStore with empty results.
// Used when Supabase env vars are not configured.

import type {
  IDashboardStore,
  DashboardListOptions,
  DashboardListResult,
} from "@/lib/interfaces/i-dashboard-store";

export class MockDashboardStore implements IDashboardStore {
  async list(_options: DashboardListOptions): Promise<DashboardListResult> {
    return { rows: [], total: 0 };
  }

  async deleteAudit(_auditId: string): Promise<void> {
    // no-op
  }
}
