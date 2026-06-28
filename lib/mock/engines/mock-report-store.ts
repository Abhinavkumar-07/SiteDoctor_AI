// lib/mock/engines/mock-report-store.ts
//
// Satisfies IReportStore without touching any database.
// save() stores in a globalThis Map so the mock behaves consistently
// across hot-reloads in development.
// Used in tests and as the fallback when Supabase env vars are absent.
// Replaced by SupabaseReportStore in Step 8.6 (production).

import type { IReportStore } from "@/lib/interfaces/i-report-store";
import type { AuditReportResponse } from "@/lib/types/audit-api";

const GLOBAL_KEY = "__sitedoctor_mock_report_store__";

declare global {
  // eslint-disable-next-line no-var
  var __sitedoctor_mock_report_store__:
    | Map<string, AuditReportResponse>
    | undefined;
}

function getMap(): Map<string, AuditReportResponse> {
  if (!globalThis[GLOBAL_KEY]) {
    globalThis[GLOBAL_KEY] = new Map<string, AuditReportResponse>();
  }
  return globalThis[GLOBAL_KEY]!;
}

export class MockReportStore implements IReportStore {
  async save(report: AuditReportResponse): Promise<void> {
    getMap().set(report.auditId, report);
  }

  async findByAuditId(auditId: string): Promise<AuditReportResponse | null> {
    return getMap().get(auditId) ?? null;
  }

  async deleteByAuditId(auditId: string): Promise<void> {
    getMap().delete(auditId);
  }
}
