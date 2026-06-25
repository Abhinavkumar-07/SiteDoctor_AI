// lib/types/share-report.ts
//
// The public share endpoint returns the same audit data as the private
// report endpoint, plus a shareToken field and without private metadata.
// We extend AuditReport so the existing 7.6 components can consume it directly.

import type { AuditReport } from "@/lib/types/audit-report";

export interface ShareReport extends AuditReport {
  /** The token used to access this public share link. */
  shareToken: string;
  /**
   * Whether this share link is still valid.
   * The backend may expire links after N days.
   */
  isExpired: boolean;
  /** ISO-8601 — when this share link was created. */
  sharedAt: string;
}
