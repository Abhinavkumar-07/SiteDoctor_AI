/**
 * Destination : lib/types/audit.ts
 * Dependencies: none — consumed by both client and server code,
 *               so no server-only imports allowed here.
 *
 * All shapes derived from API_Contract.md §2–4.
 */

// ── Request ────────────────────────────────────────────────────────────────────

export interface CreateAuditRequest {
  /** Fully-qualified HTTPS URL, already normalized by the Zod schema. */
  url: string;
}

// ── Responses — success ────────────────────────────────────────────────────────

/**
 * POST /api/v1/audits → 202
 * A new audit job was created and queued.
 */
export interface AuditAcceptedResponse {
  id: string;
  slug: string;
  reportUrl: string;
  status: "queued";
  url: string;
  createdAt: string;
}

/**
 * POST /api/v1/audits → 200
 * A recent completed audit for the same URL was found in cache.
 * Redirect straight to the report instead of re-running the pipeline.
 */
export interface AuditCacheHitResponse {
  id: string;
  slug: string;
  reportUrl: string;
  status: "completed";
  url: string;
  cached: true;
  completedAt: string;
}

export type CreateAuditResponse = AuditAcceptedResponse | AuditCacheHitResponse;

// ── Response — error ───────────────────────────────────────────────────────────

/** Every API error uses this envelope (API_Contract.md §4). */
export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "DISALLOWED_TARGET"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "AUDIT_NOT_FOUND"
  | "REPORT_NOT_FOUND"
  | "AUDIT_IN_PROGRESS"
  | "AUDIT_NOT_COMPLETE"
  | "REPORT_GONE"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE";

// ── Submission UI state ────────────────────────────────────────────────────────

export type SubmissionStatus =
  | "idle"
  | "submitting"
  | "redirecting"
  | "error";

/**
 * User-facing messages keyed by API error code.
 *
 * AUDIT_IN_PROGRESS is intentionally absent — it is not an error from the
 * user's perspective. The form detects it and redirects to the existing
 * job rather than displaying a message.
 */
export const SUBMISSION_ERROR_MESSAGES: Partial<Record<ApiErrorCode, string>> =
  {
    VALIDATION_ERROR:
      "That URL doesn't look right. Double-check it and try again.",
    DISALLOWED_TARGET:
      "Only public websites can be audited. Local and private addresses are not supported.",
    RATE_LIMITED:
      "You've run several audits recently. Wait a moment, then try again.",
    INTERNAL_ERROR:
      "Something went wrong on our end. Please try again in a moment.",
    SERVICE_UNAVAILABLE:
      "SiteDoctor AI is briefly unavailable. Please try again shortly.",
  };

export const SUBMISSION_FALLBACK_ERROR =
  "Something went wrong. Check your connection and try again.";
