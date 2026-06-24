// lib/types/audit-status.ts

export type AuditStatusValue =
  | "queued"
  | "processing"
  | "completed"
  | "failed";

export type AuditStageId =
  | "screenshot"
  | "lighthouse"
  | "seo"
  | "security"
  | "accessibility";

export type AuditStageStatus = "pending" | "running" | "done" | "error";

export interface AuditStage {
  id: AuditStageId;
  label: string;
  status: AuditStageStatus;
}

export interface AuditStatusResponse {
  auditId: string;
  status: AuditStatusValue;
  url: string;
  /** Clamped to [0, 100] by the hook; raw value comes from the API. */
  progress: number;
  stages: AuditStage[];
  /** Present only when status === "completed". */
  reportSlug?: string;
  /** Present only when status === "failed". */
  errorMessage?: string;
  /** ISO-8601 timestamp. */
  createdAt: string;
  /** ISO-8601 timestamp. */
  updatedAt: string;
}

// ── Runtime type guard ─────────────────────────────────────────────────────────
// Validates the API response shape at runtime so that unexpected payloads throw
// before they can corrupt state rather than triggering cryptic render errors.

const VALID_STATUSES = new Set<string>([
  "queued",
  "processing",
  "completed",
  "failed",
]);

const VALID_STAGE_STATUSES = new Set<string>([
  "pending",
  "running",
  "done",
  "error",
]);

function isAuditStage(v: unknown): v is AuditStage {
  if (!v || typeof v !== "object") return false;
  const s = v as Record<string, unknown>;
  return (
    typeof s.id === "string" &&
    typeof s.label === "string" &&
    typeof s.status === "string" &&
    VALID_STAGE_STATUSES.has(s.status)
  );
}

export function isAuditStatusResponse(v: unknown): v is AuditStatusResponse {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.auditId === "string" &&
    typeof r.status === "string" &&
    VALID_STATUSES.has(r.status) &&
    typeof r.url === "string" &&
    typeof r.progress === "number" &&
    Number.isFinite(r.progress) &&
    Array.isArray(r.stages) &&
    r.stages.every(isAuditStage) &&
    typeof r.createdAt === "string" &&
    typeof r.updatedAt === "string" &&
    // Optional fields — if present they must be strings
    (r.reportSlug === undefined || typeof r.reportSlug === "string") &&
    (r.errorMessage === undefined || typeof r.errorMessage === "string")
  );
}
