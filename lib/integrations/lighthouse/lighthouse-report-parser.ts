// lib/integrations/lighthouse/lighthouse-report-parser.ts
//
// Pure transformation layer: raw Lighthouse JSON → typed domain objects.
//
// Responsibilities:
//   1. Extract category scores and map to our CategoryId enum.
//   2. Derive a grade letter from a numeric score.
//   3. Extract human-readable opportunity/diagnostic descriptions
//      as the basis for Recommendations.
//   4. Build the report metadata block from LHR internals.
//
// This file has ZERO side effects — no async, no I/O, fully unit-testable.
//
// ── Category mapping ──────────────────────────────────────────────────────────
// Lighthouse exposes 4 categories we can map directly:
//   performance     → performance
//   accessibility   → accessibility
//   seo             → seo
//   best-practices  → security (closest conceptual match for now)
//
// UX and Conversion have no Lighthouse equivalents.
// They remain mock-seeded from the URL hash until Gemini lands in Step 8.5.
//
// ── Step 8.5 migration ────────────────────────────────────────────────────────
// When GeminiRecommendationGenerator is wired in:
//   - extractRawOpportunities() output is forwarded to Gemini as context.
//   - The `recommendations` array returned here is replaced by Gemini output.
//   - This parser file is unchanged.

import type { Result as LHResult } from "lighthouse";
import type {
  CategoryScore,
  Recommendation,
  CategoryId,
  Grade,
} from "@/lib/types/audit-api";
import { recId } from "@/lib/utils/id";

// ── Grade derivation ─────────────────────────────────────────────────────────

export function scoreToGrade(score: number): Grade {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  return "F";
}

// ── Category score extraction ────────────────────────────────────────────────

/**
 * Maps a Lighthouse category key to our internal CategoryId.
 * Returns null for categories we don't track.
 */
function lhCategoryToId(
  lhKey: string,
): CategoryId | null {
  switch (lhKey) {
    case "performance":   return "performance";
    case "accessibility": return "accessibility";
    case "seo":           return "seo";
    case "best-practices": return "security";
    default:              return null;
  }
}

const CATEGORY_LABEL: Record<CategoryId, string> = {
  performance:   "Performance",
  seo:           "SEO",
  security:      "Security",
  accessibility: "Accessibility",
  ux:            "UX",
  conversion:    "Conversion",
};

function buildCategorySummary(id: CategoryId, score: number): string {
  const high = score >= 75;
  switch (id) {
    case "performance":
      return high
        ? "Page loads quickly with good Core Web Vitals. LCP and CLS are within acceptable ranges."
        : "Page load times are above average. LCP likely exceeds 2.5 s on mobile. Defer non-critical JavaScript and optimise images.";
    case "seo":
      return high
        ? "Strong meta tags, structured data, and crawlability. Title and description are well-optimised."
        : "Missing or poorly-formed meta tags detected. Review heading hierarchy and ensure all images have descriptive alt text.";
    case "security":
      return high
        ? "HTTPS enforced. No major best-practice violations detected by Lighthouse."
        : "Lighthouse best-practices audit flagged issues. Review HTTPS usage, mixed content, and deprecated APIs.";
    case "accessibility":
      return high
        ? "WCAG 2.1 AA largely met. Keyboard navigation and ARIA labels appear well implemented."
        : "Accessibility violations detected. Colour contrast, missing labels, and keyboard navigation need attention.";
    case "ux":
      return high
        ? "Clear visual hierarchy and consistent interactive patterns across the site."
        : "UX analysis pending deeper tooling. Tap target sizes and mobile font sizes may need review.";
    case "conversion":
      return high
        ? "Clear CTAs and trust signals present above the fold."
        : "Conversion analysis pending deeper tooling. CTA placement and social proof may need attention.";
  }
}

/** Extracts the four Lighthouse categories from the LHR. */
export function extractCategoryScores(lhr: LHResult): CategoryScore[] {
  const scores: CategoryScore[] = [];

  for (const [key, category] of Object.entries(
   lhr.categories ?? {}
)) {
    const id = lhCategoryToId(key);
    if (!id) continue;

    // Lighthouse scores are 0–1; multiply by 100 and round
    const raw = category.score ?? 0;
    const score = Math.round(raw * 100);

    scores.push({
      id,
      label: CATEGORY_LABEL[id],
      score,
      grade: scoreToGrade(score),
      summary: buildCategorySummary(id, score),
    });
  }

  return scores;
}

// ── Opportunity / diagnostic extraction ──────────────────────────────────────

export interface RawOpportunity {
  auditId: string;
  title: string;
  description: string;
  /** Estimated savings in ms, bytes, etc. — null if not available */
  displayValue: string | null;
  score: number | null;
}

/**
 * Extracts failed / warn audits from the performance category as opportunities.
 * These feed into Recommendation generation (Step 8.5: Gemini).
 */
export function extractRawOpportunities(lhr: LHResult): RawOpportunity[] {
  const perfCategory = lhr.categories["performance"];
  if (!perfCategory) return [];

  return perfCategory.auditRefs
    .map((ref) => lhr.audits[ref.id])
    .filter(
      (audit): audit is NonNullable<typeof audit> =>
        !!audit &&
        audit.score !== null &&
        audit.score !== undefined &&
        audit.score < 0.9 &&
        audit.details?.type === "opportunity",
    )
    .map((audit) => ({
      auditId: audit.id,
      title: audit.title,
      description: audit.description,
      displayValue: audit.displayValue ?? null,
      score: audit.score,
    }));
}

// ── Recommendation derivation ────────────────────────────────────────────────

/**
 * Converts Lighthouse opportunities into our Recommendation shape.
 * Step 8.5: this list is forwarded to Gemini for enrichment/replacement.
 */
export function buildRecommendationsFromOpportunities(
  opportunities: RawOpportunity[],
): Recommendation[] {
  return opportunities.slice(0, 8).map((opp, i) => {
    // Derive priority from score: lower score = higher priority
    const score = opp.score ?? 0.5;
    const priority =
      score < 0.3 ? "high" : score < 0.6 ? "medium" : "low";

    // Derive effort heuristic from audit ID patterns
    const effort =
      opp.auditId.includes("render-blocking") ||
      opp.auditId.includes("unused")
        ? "medium"
        : opp.auditId.includes("image") ||
            opp.auditId.includes("text-compression")
          ? "low"
          : "medium";

    const impact = opp.displayValue
      ? `Estimated saving: ${opp.displayValue}`
      : "Improve page performance score";

    return {
      id: recId("performance", i),
      category: "performance" as CategoryId,
      title: opp.title,
      description: opp.description,
      priority,
      effort,
      impact,
    };
  });
}

// ── Metadata extraction ───────────────────────────────────────────────────────

export interface LighthouseMetadata {
  lighthouseVersion: string;
  userAgent: string;
  fetchTime: string;
  environment: string;
}

export function extractMetadata(lhr: LHResult): LighthouseMetadata {
  return {
    lighthouseVersion: lhr.lighthouseVersion,
    userAgent: lhr.userAgent,
    fetchTime: lhr.fetchTime,
    environment: lhr.environment?.networkUserAgent ?? "lighthouse",
  };
}

// ── Overall score ─────────────────────────────────────────────────────────────

/**
 * Computes a weighted overall score from the available Lighthouse categories.
 * Weights are tuned to our product priorities.
 */
export function computeOverallScore(categories: CategoryScore[]): number {
  const weights: Partial<Record<CategoryId, number>> = {
    performance:   0.35,
    seo:           0.25,
    security:      0.25,
    accessibility: 0.15,
  };

  let totalWeight = 0;
  let weightedSum = 0;

  for (const cat of categories) {
    const w = weights[cat.id] ?? 0;
    weightedSum += cat.score * w;
    totalWeight += w;
  }

  if (totalWeight === 0) return 50;
  return Math.round(weightedSum / totalWeight);
}

// ── Overall summary ───────────────────────────────────────────────────────────

export function buildOverallSummary(
  url: string,
  overallScore: number,
  categories: CategoryScore[],
): string {
  const worst = [...categories].sort((a, b) => a.score - b.score)[0];
  const best = [...categories].sort((a, b) => b.score - a.score)[0];

  if (overallScore >= 80) {
    return `${url} performs well across all measured dimensions. ${best?.label ?? "Performance"} is the strongest area (${best?.score ?? "—"}). Focus remaining effort on ${worst?.label ?? "accessibility"} to reach top-tier scores.`;
  }

  if (overallScore >= 60) {
    return `${url} meets baseline standards but has room for improvement. ${worst?.label ?? "Performance"} (${worst?.score ?? "—"}) is the weakest category and should be prioritised first.`;
  }

  return `${url} has significant issues across multiple areas. ${worst?.label ?? "Performance"} (${worst?.score ?? "—"}) requires immediate attention, followed by ${best?.label ?? "SEO"} optimisation.`;
}
