// lib/types/audit-api.ts
//
// Request and response types for the v1 API layer.
// These live separately from the frontend types (lib/types/audit-report.ts,
// lib/types/audit-status.ts) so the service layer can have a clear boundary.
// The shapes are intentionally compatible with what the frontend already expects.

// ── Shared primitives ─────────────────────────────────────────────────────────

export type AuditStatusValue =
  | "queued"
  | "processing"
  | "completed"
  | "failed";

export type AuditStageStatus = "pending" | "running" | "done" | "error";

export type CategoryId =
  | "performance"
  | "seo"
  | "security"
  | "accessibility"
  | "ux"
  | "conversion";

export type Grade = "A" | "B" | "C" | "D" | "F";
export type Priority = "high" | "medium" | "low";
export type Effort = "low" | "medium" | "high";

// ── POST /api/v1/audits ───────────────────────────────────────────────────────

export interface CreateAuditRequest {
  url: string;
}

export interface CreateAuditResponse {
  auditId: string;
  status: "queued";
  createdAt: string;
}

// ── GET /api/v1/audits/:auditId/status ────────────────────────────────────────

export interface AuditStage {
  id: string;
  label: string;
  status: AuditStageStatus;
}

export interface AuditStatusResponse {
  auditId: string;
  status: AuditStatusValue;
  url: string;
  progress: number;
  stages: AuditStage[];
  reportSlug?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// ── GET /api/v1/audits/:auditId/report ────────────────────────────────────────

export interface CategoryScore {
  id: CategoryId;
  label: string;
  score: number;
  grade: Grade;
  summary: string;
}

export interface Recommendation {
  id: string;
  category: CategoryId;
  title: string;
  description: string;
  priority: Priority;
  effort: Effort;
  impact: string;
}

export interface Screenshots {
  desktopUrl: string | null;
  mobileUrl: string | null;
}

export interface AuditReportResponse {
  auditId: string;
  url: string;
  completedAt: string;
  overallScore: number;
  overallGrade: Grade;
  summary: string;
  categories: CategoryScore[];
  recommendations: Recommendation[];
  screenshots: Screenshots;
  metadata: {
    lighthouseVersion: string;
    userAgent: string;
    fetchTime: string;
    environment: string;
  };
}

// ── GET /api/v1/share/:shareToken ─────────────────────────────────────────────

export interface ShareReportResponse extends AuditReportResponse {
  shareToken: string;
  isExpired: boolean;
  sharedAt: string;
}

// ── Internal store record (in-process mock state) ─────────────────────────────

export interface AuditRecord {
  auditId: string;
  url: string;
  createdAt: string;          // ISO-8601
  shareToken: string;         // deterministic from auditId
}
