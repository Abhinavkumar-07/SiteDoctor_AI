// lib/integrations/lighthouse/lighthouse-audit-engine.ts
//
// Implements IAuditEngine.
// This is the primary engine from Step 8.4 onwards.
//
// getStatus():
//   Still time-based (identical logic to PlaywrightAuditEngine).
//   Step 8.5+ will replace this with real job-queue status polling
//   once background workers and Supabase are wired in.
//
// buildReport():
//   Full real pipeline:
//     1. Capture screenshots (Playwright, local storage)
//     2. Run Lighthouse (against shared Chrome instance)
//     3. Parse Lighthouse JSON → CategoryScore[], recommendations, metadata
//     4. Supplement with mock UX + Conversion scores (no Lighthouse equivalent)
//     5. Inject real screenshot URLs
//     6. Return complete AuditReportResponse
//
// Failure strategy:
//   - Screenshot failure → non-fatal, null URLs returned
//   - Lighthouse failure → non-fatal, falls back to mock scores with a log
//   This keeps the platform usable even when Lighthouse times out on
//   slow/unreachable sites.

import type { IAuditEngine } from "@/lib/interfaces/i-audit-engine";
import type {
  AuditStatusResponse,
  AuditReportResponse,
  AuditStage,
  AuditStatusValue,
  CategoryScore,
  Recommendation,
} from "@/lib/types/audit-api";
import { PlaywrightScreenshotProvider } from "@/lib/integrations/playwright/playwright-screenshot-provider";
import { LocalScreenshotStorage } from "@/lib/integrations/playwright/local-screenshot-storage";
import { runLighthouse } from "./lighthouse-runner";
import {
  extractCategoryScores,
  extractRawOpportunities,
  buildRecommendationsFromOpportunities,
  extractMetadata,
  computeOverallScore,
  buildOverallSummary,
  scoreToGrade,
} from "./lighthouse-report-parser";

// ── Stage definitions (shared with PlaywrightAuditEngine) ─────────────────────

interface StageDef {
  id: string;
  label: string;
  startSec: number;
  endSec: number;
}

const STAGES: StageDef[] = [
  { id: "queued",        label: "Queued",                startSec: 0,  endSec: 2  },
  { id: "initializing",  label: "Initializing",          startSec: 2,  endSec: 4  },
  { id: "browser",       label: "Launching Browser",     startSec: 4,  endSec: 6  },
  { id: "lighthouse",    label: "Running Lighthouse",    startSec: 6,  endSec: 9  },
  { id: "screenshot",    label: "Capturing Screenshots", startSec: 9,  endSec: 12 },
  { id: "ai",            label: "Running AI Analysis",   startSec: 12, endSec: 16 },
  { id: "generating",    label: "Generating Report",     startSec: 16, endSec: 19 },
];

const COMPLETE_SEC = 19;

function elapsedSec(createdAt: string): number {
  return (Date.now() - new Date(createdAt).getTime()) / 1000;
}

// ── Mock supplement for UX + Conversion ──────────────────────────────────────
// Lighthouse has no UX or Conversion categories.
// We seed scores from the URL hash until Gemini lands in Step 8.5.

function hashScore(seed: string, salt: string): number {
  const str = seed + salt;
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return 40 + (Math.abs(hash) % 59);
}

function buildSupplementalCategories(url: string): CategoryScore[] {
  const uxScore = hashScore(url, "ux");
  const convScore = hashScore(url, "conversion");

  return [
    {
      id: "ux",
      label: "UX",
      score: uxScore,
      grade: scoreToGrade(uxScore),
      summary:
        uxScore >= 75
          ? "Clear visual hierarchy and consistent interactive patterns across the site."
          : "Mobile tap targets are too small in the navigation. Font sizes drop below 14 px on product cards.",
    },
    {
      id: "conversion",
      label: "Conversion",
      score: convScore,
      grade: scoreToGrade(convScore),
      summary:
        convScore >= 75
          ? "Clear CTAs above the fold and trust signals present."
          : "Primary CTA is below the fold on mobile. Social proof elements are absent from the landing page.",
    },
  ];
}

// ── Static recommendation fallback ───────────────────────────────────────────
// If Lighthouse finds no opportunities (e.g. a very fast site), we still
// return a minimal set of actionable recommendations.

const FALLBACK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "rec_seo_0",
    category: "seo",
    title: "Verify structured data markup",
    description:
      "Ensure Organisation, BreadcrumbList, and Product schema are present to maximise rich-snippet eligibility.",
    priority: "low",
    effort: "medium",
    impact: "Enable rich search snippets",
  },
  {
    id: "rec_accessibility_0",
    category: "accessibility",
    title: "Audit colour contrast across all themes",
    description:
      "Run a manual WCAG 2.1 AA colour contrast check across light and dark themes, particularly for interactive elements.",
    priority: "medium",
    effort: "low",
    impact: "Improve accessibility score and WCAG compliance",
  },
];

// ── LighthouseAuditEngine ─────────────────────────────────────────────────────

export class LighthouseAuditEngine implements IAuditEngine {
  // ── getStatus — time-based progression (unchanged from Playwright engine) ───
  getStatus(
    auditId: string,
    url: string,
    createdAt: string,
  ): AuditStatusResponse {
    const sec = elapsedSec(createdAt);

    const overallStatus: AuditStatusValue =
      sec < 2 ? "queued" : sec >= COMPLETE_SEC ? "completed" : "processing";

    const progress =
      overallStatus === "completed"
        ? 100
        : Math.min(90, Math.round((sec / COMPLETE_SEC) * 90));

    const stages: AuditStage[] = STAGES.map((def) => ({
      id: def.id,
      label: def.label,
      status:
        overallStatus === "completed"
          ? "done"
          : sec < def.startSec
            ? "pending"
            : sec < def.endSec
              ? "running"
              : "done",
    }));

    return {
      auditId,
      status: overallStatus,
      url,
      progress,
      stages,
      reportSlug: overallStatus === "completed" ? auditId : undefined,
      createdAt,
      updatedAt: new Date().toISOString(),
    };
  }

  // ── buildReport — real Lighthouse + real screenshots ─────────────────────
  async buildReport(
    auditId: string,
    url: string,
    createdAt: string,
  ): Promise<AuditReportResponse> {
    const completedAt = new Date().toISOString();

    // ── Step 1: Capture screenshots ─────────────────────────────────────────
    const storage = new LocalScreenshotStorage();
    const screenshotProvider = new PlaywrightScreenshotProvider(
      storage,
      auditId,
    );

    let screenshotResult = {
      desktopUrl: null as string | null,
      mobileUrl: null as string | null,
    };

    try {
      screenshotResult = await screenshotProvider.capture(url);
    } catch (err) {
      console.error(
        `[LighthouseAuditEngine] Screenshot capture failed for ${url}:`,
        err,
      );
      // Non-fatal — continue with null screenshots
    }

    // ── Step 2 + 3: Run Lighthouse and parse results ─────────────────────────
    let lhCategories: CategoryScore[] = [];
    let recommendations: Recommendation[] =
  FALLBACK_RECOMMENDATIONS;
    const defaultMetadata = {
  lighthouseVersion: "unknown",
  userAgent: "",
  fetchTime: createdAt,
  environment: "lighthouse",
};

let metadata = defaultMetadata;

    try {
      const { lhr } = await runLighthouse(url, { formFactor: "desktop" });

      lhCategories = extractCategoryScores(lhr);
      const opportunities = extractRawOpportunities(lhr);
      recommendations =
        opportunities.length > 0
          ? buildRecommendationsFromOpportunities(opportunities)
          : FALLBACK_RECOMMENDATIONS;
      metadata = extractMetadata(lhr);
    } catch (err) {
      console.error(
        `[LighthouseAuditEngine] Lighthouse failed for ${url}:`,
        err,
      );
      // Non-fatal fallback: use mock scores so the report still loads
      lhCategories = [];
      recommendations = FALLBACK_RECOMMENDATIONS;
    }

    // ── Step 4: Supplement with UX + Conversion (no Lighthouse equivalent) ──
    const supplemental = buildSupplementalCategories(url);

    // Merge: real LH categories take priority; supplemental fills the gaps
    const lhCategoryIds = new Set(lhCategories.map((c) => c.id));
    const allCategories: CategoryScore[] = [
      ...lhCategories,
      ...supplemental.filter((s) => !lhCategoryIds.has(s.id)),
    ];

    // Guarantee canonical order for the frontend grid
    const ORDER: CategoryScore["id"][] = [
      "performance",
      "seo",
      "security",
      "accessibility",
      "ux",
      "conversion",
    ];
    allCategories.sort(
      (a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id),
    );

    // ── Step 5: Compute overall score from real categories only ─────────────
    const overallScore = computeOverallScore(
  allCategories.filter(
    (c) =>
      c.id !== "ux" &&
      c.id !== "conversion"
  ),
);
    const overallGrade = scoreToGrade(overallScore);
    const summary = buildOverallSummary(url, overallScore, allCategories);

    // ── Step 6: Assemble and return ─────────────────────────────────────────
    return {
      auditId,
      url,
      completedAt,
      overallScore,
      overallGrade,
      summary,
      categories: allCategories,
      recommendations,
      screenshots: screenshotResult,
      metadata,
    };
  }
}
