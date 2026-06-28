// lib/interfaces/i-report-store.ts
//
// Contract for persisting and retrieving full audit report data.
// Kept separate from IAuditStore because report data is large (JSONB blobs)
// and has a different lifecycle: written once after Lighthouse completes,
// read on every report page visit.
//
// In Step 8.1–8.5: satisfied by MockReportStore (no-op, always returns null).
// In Step 8.6+:    satisfied by SupabaseReportStore.
//
// Nothing in the existing codebase imports this yet — it is purely additive.

import type { AuditReportResponse } from "@/lib/types/audit-api";

export interface PersistedReport {
  auditId: string;
  summary: string;
  metadata: AuditReportResponse["metadata"];
  screenshots: AuditReportResponse["screenshots"];
  categories: AuditReportResponse["categories"];
  recommendations: AuditReportResponse["recommendations"];
  /** Raw Lighthouse JSON blob — stored for future re-parsing */
  rawLhr: unknown | null;
  createdAt: string;
}

export interface IReportStore {
  /**
   * Persist a completed audit report.
   * Called once per audit, immediately after LighthouseAuditEngine.buildReport().
   * Idempotent — re-saving the same auditId should upsert, not error.
   */
  save(report: AuditReportResponse, rawLhr?: unknown): Promise<void>;

  /**
   * Retrieve a previously persisted report by auditId.
   * Returns null if not found — callers must handle the missing case.
   */
  findByAuditId(auditId: string): Promise<AuditReportResponse | null>;

  /**
   * Delete a report by auditId.
   * Used by the dashboard delete action.
   */
  deleteByAuditId(auditId: string): Promise<void>;
}
