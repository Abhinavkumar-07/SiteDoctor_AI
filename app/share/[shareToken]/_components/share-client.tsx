// app/share/[shareToken]/_components/share-client.tsx
"use client";

import { useShareReport } from "@/hooks/use-share-report";

// ── Share-specific components (this step) ─────────────────────────────────────
import { ShareLoadingSkeleton } from "./share-loading-skeleton";
import { ShareExpiredState } from "./share-expired-state";
import { ShareNotFoundState } from "./share-not-found-state";
import { ShareErrorState } from "./share-error-state";
import { PublicReportHeader } from "./public-report-header";
import { ShareToolbar } from "./share-toolbar";

// ── Reused from Step 7.6 (/app/report/[auditId]/_components) ──────────────────
// These are imported from their authoritative locations.
// Prerequisite: Step 7.6 must be placed before placing Step 7.7.
import { OverallScoreSection } from "@/app/report/[auditId]/_components/overall-score-section";
import { CategoryScoresSection } from "@/app/report/[auditId]/_components/category-scores-section";
import { RecommendationsSection } from "@/app/report/[auditId]/_components/recommendations-section";
import { ScreenshotSection } from "@/app/report/[auditId]/_components/screenshot-section";

interface ShareClientProps {
  shareToken: string;
}

export function ShareClient({ shareToken }: ShareClientProps) {
  const {
    report,
    isLoading,
    isError,
    isExpired,
    isNotFound,
    errorMessage,
    mutate,
  } = useShareReport(shareToken);

  // ── Loading ──
  if (isLoading) return <ShareLoadingSkeleton />;

  // ── Expired (410) ──
  if (isExpired) return <ShareExpiredState shareToken={shareToken} />;

  // ── Not found (404) ──
  if (isNotFound) return <ShareNotFoundState shareToken={shareToken} />;

  // ── Generic error ──
  if (isError) {
    return (
      <ShareErrorState
        shareToken={shareToken}
        message={errorMessage ?? undefined}
        onRetry={mutate}
      />
    );
  }

  // ── No data (guard) ──
  if (!report) return <ShareNotFoundState shareToken={shareToken} />;

  return (
    <div className="space-y-10">
      {/* Public header — share-specific (score pill, share token, branding) */}
      <PublicReportHeader
        url={report.url}
        shareToken={shareToken}
        sharedAt={report.sharedAt}
        overallScore={report.overallScore}
        overallGrade={report.overallGrade}
      />

      {/* Share toolbar — positioned early so it's immediately visible */}
      <ShareToolbar shareToken={shareToken} auditedUrl={report.url} />

      {/* ── Reused 7.6 report sections ─────────────────────────────────────── */}

      {/* Overall score ring (reused exactly as-is) */}
      <OverallScoreSection
        score={report.overallScore}
        grade={report.overallGrade}
        summary={report.summary}
      />

      {/* 6 category score cards (reused exactly as-is) */}
      <CategoryScoresSection categories={report.categories} />

      {/* Priority recommendations accordion (reused exactly as-is) */}
      <RecommendationsSection recommendations={report.recommendations} />

      {/* Desktop/mobile screenshot tab switcher (reused exactly as-is) */}
      <ScreenshotSection screenshots={report.screenshots} />

      {/* Second share toolbar at bottom for convenience */}
      <ShareToolbar shareToken={shareToken} auditedUrl={report.url} />
    </div>
  );
}
