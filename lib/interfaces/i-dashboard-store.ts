// lib/interfaces/i-dashboard-store.ts
//
// Contract for querying the audit list for the dashboard.
// Separate from IAuditStore because listing with pagination, search, and
// score filtering is a read-heavy query concern — not part of the
// create/find-by-id lifecycle that IAuditStore owns.
//
// In Step 8.6: satisfied by SupabaseDashboardStore.
// Fallback: MockDashboardStore returns empty results.

export interface DashboardAuditRow {
  auditId: string;
  url: string;
  shareToken: string;
  status: string;
  overallScore: number | null;
  overallGrade: string | null;
  createdAt: string;
  completedAt: string | null;
  screenshotUrl: string | null;   // desktop screenshot URL from audit_reports
}

export interface DashboardListOptions {
  page: number;
  limit: number;
  search?: string;
  minScore?: number;
}

export interface DashboardListResult {
  rows: DashboardAuditRow[];
  total: number;
}

export interface IDashboardStore {
  list(options: DashboardListOptions): Promise<DashboardListResult>;
  deleteAudit(auditId: string): Promise<void>;
}
