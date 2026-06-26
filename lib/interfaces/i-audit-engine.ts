// lib/interfaces/i-audit-engine.ts
//
// Contract for executing a full audit against a URL.
// In Step 8.1–8.2 this is satisfied by MockAuditEngine.
// In Step 8.3+ it drives the real Playwright + Lighthouse + Gemini pipeline.

import type { AuditStatusResponse, AuditReportResponse } from "@/lib/types/audit-api";

export interface IAuditEngine {
  /**
   * Compute the current processing status for a given audit.
   * Called on every status poll — must be fast (no side effects).
   */
  getStatus(auditId: string, url: string, createdAt: string): AuditStatusResponse;

  /**
   * Build the complete report for a finished audit.
   * Only called once status === "completed".
   */
  buildReport(auditId: string, url: string, createdAt: string): Promise<AuditReportResponse>;
}
