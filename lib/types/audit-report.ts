// lib/types/audit-report.ts

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

export interface CategoryScore {
  id: CategoryId;
  label: string;
  score: number;       // 0–100
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
  impact: string;      // human-readable e.g. "Reduce LCP by ~800ms"
}

export interface Screenshots {
  desktopUrl: string | null;
  mobileUrl: string | null;
}

export interface AuditReport {
  auditId: string;
  url: string;
  completedAt: string;          // ISO-8601
  overallScore: number;         // 0–100
  overallGrade: Grade;
  summary: string;
  categories: CategoryScore[];
  recommendations: Recommendation[];
  screenshots: Screenshots;
  metadata: {
    lighthouseVersion: string;
    userAgent: string;
    fetchTime: string;          // ISO-8601
    environment: string;
  };
}
