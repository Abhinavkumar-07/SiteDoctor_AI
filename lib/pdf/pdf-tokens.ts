// lib/pdf/pdf-tokens.ts
//
// All PDF colours and typography in one place.
// These are STATIC values — @react-pdf/renderer operates outside the browser
// CSS cascade, so we cannot use CSS variables here.
// Mirror the dark-mode neutral palette from globals.css so the PDF looks
// consistent with the app's dark design system.

export const PDF_COLORS = {
  // Backgrounds
  pageBg: "#0a0a0a",
  cardBg: "#111111",
  cardBorder: "#222222",
  sectionBg: "#161616",

  // Text
  textPrimary: "#f5f5f5",
  textSecondary: "#a3a3a3",
  textMuted: "#525252",

  // Brand
  brand: "#6366f1", // indigo-500 — matches primary in globals.css

  // Grades
  gradeA: "#10b981", // emerald-500
  gradeB: "#22c55e", // green-500
  gradeC: "#eab308", // yellow-500
  gradeD: "#f97316", // orange-500
  gradeF: "#ef4444", // red-500

  // Priority
  priorityHigh: "#ef4444",
  priorityMedium: "#eab308",
  priorityLow: "#60a5fa",

  // Utility
  divider: "#262626",
  white: "#ffffff",
} as const;

export const PDF_FONTS = {
  // @react-pdf/renderer bundles Helvetica; no external font load needed.
  base: "Helvetica",
  bold: "Helvetica-Bold",
  mono: "Courier",
} as const;

export const PDF_SIZES = {
  // Page
  pageMarginH: 36,  // pt
  pageMarginV: 40,  // pt

  // Typography
  title: 20,
  h1: 16,
  h2: 13,
  h3: 11,
  body: 9,
  small: 8,
  caption: 7,

  // Spacing
  sectionGap: 20,
  rowGap: 6,
  cardPad: 12,
  cardRadius: 4,
} as const;

/** Returns the hex colour for a numeric score. */
export function scoreColor(score: number): string {
  if (score >= 90) return PDF_COLORS.gradeA;
  if (score >= 75) return PDF_COLORS.gradeB;
  if (score >= 60) return PDF_COLORS.gradeC;
  if (score >= 45) return PDF_COLORS.gradeD;
  return PDF_COLORS.gradeF;
}

/** Returns the hex colour for a grade letter. */
export function gradeColor(grade: string): string {
  switch (grade) {
    case "A": return PDF_COLORS.gradeA;
    case "B": return PDF_COLORS.gradeB;
    case "C": return PDF_COLORS.gradeC;
    case "D": return PDF_COLORS.gradeD;
    default:  return PDF_COLORS.gradeF;
  }
}

/** Returns the hex colour for a priority level. */
export function priorityColor(priority: string): string {
  switch (priority) {
    case "high":   return PDF_COLORS.priorityHigh;
    case "medium": return PDF_COLORS.priorityMedium;
    default:       return PDF_COLORS.priorityLow;
  }
}
