// lib/utils/report-utils.ts
import type { Grade, Priority, Effort } from "@/lib/types/audit-report";

// ── Grade helpers ──────────────────────────────────────────────────────────────

export function scoreToGrade(score: number): Grade {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  return "F";
}

export const GRADE_COLOR: Record<Grade, string> = {
  A: "text-emerald-500",
  B: "text-green-500",
  C: "text-yellow-500",
  D: "text-orange-500",
  F: "text-red-500",
};

export const GRADE_BG: Record<Grade, string> = {
  A: "bg-emerald-500/10 border-emerald-500/20",
  B: "bg-green-500/10 border-green-500/20",
  C: "bg-yellow-500/10 border-yellow-500/20",
  D: "bg-orange-500/10 border-orange-500/20",
  F: "bg-red-500/10 border-red-500/20",
};

export const GRADE_PROGRESS: Record<Grade, string> = {
  A: "bg-emerald-500",
  B: "bg-green-500",
  C: "bg-yellow-500",
  D: "bg-orange-500",
  F: "bg-red-500",
};

// ── Priority helpers ───────────────────────────────────────────────────────────

export const PRIORITY_COLOR: Record<Priority, string> = {
  high: "text-red-500",
  medium: "text-yellow-500",
  low: "text-blue-400",
};

export const PRIORITY_BG: Record<Priority, string> = {
  high: "bg-red-500/10 border-red-500/20 text-red-500",
  medium: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
  low: "bg-blue-400/10 border-blue-400/20 text-blue-400",
};

export const EFFORT_BG: Record<Effort, string> = {
  low: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
  medium: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
  high: "bg-red-500/10 border-red-500/20 text-red-500",
};

// ── Category icon map (lucide names) ─────────────────────────────────────────
export const CATEGORY_ICON: Record<string, string> = {
  performance: "Zap",
  seo: "Search",
  security: "Shield",
  accessibility: "Accessibility",
  ux: "MousePointerClick",
  conversion: "TrendingUp",
};
