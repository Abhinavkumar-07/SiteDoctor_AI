// app/report/[auditId]/_components/report-client.tsx
"use client";

import { useAuditReport } from "@/hooks/use-audit-report";
import { ReportHeader } from "./report-header";
import { OverallScoreSection } from "./overall-score-section";
import { CategoryScoresSection } from "./category-scores-section";
import { RecommendationsSection } from "./recommendations-section";
import { ScreenshotSection } from "./screenshot-section";
import { AuditMetadataSection } from "./audit-metadata-section";
import { ReportLoadingSkeleton } from "./report-loading-skeleton";
import { ReportEmptyState } from "./report-empty-state";
import { ReportErrorState } from "./report-error-state";

interface ReportClientProps {
  auditId: string;
}

export function ReportClient({ auditId }: ReportClientProps) {
  const { report, isLoading, isError, errorMessage, mutate } =
    useAuditReport(auditId);

  if (isLoading) return <ReportLoadingSkeleton />;

  if (isError) {
    return (
      <ReportErrorState
        auditId={auditId}
        message={errorMessage ?? undefined}
        onRetry={mutate}
      />
    );
  }

  if (!report) {
    return <ReportEmptyState auditId={auditId} />;
  }

  return (
    <div className="space-y-10">
      <ReportHeader
        url={report.url}
        auditId={report.auditId}
        completedAt={report.completedAt}
      />

      <OverallScoreSection
        score={report.overallScore}
        grade={report.overallGrade}
        summary={report.summary}
      />

      <CategoryScoresSection categories={report.categories} />

      <RecommendationsSection recommendations={report.recommendations} />

      <ScreenshotSection screenshots={report.screenshots} />

      <AuditMetadataSection
        auditId={report.auditId}
        metadata={report.metadata}
        createdAt={report.completedAt}
      />
    </div>
  );
}
