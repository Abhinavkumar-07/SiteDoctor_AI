// PATCH FILE — app/report/[auditId]/_components/report-client.tsx
//
// This is NOT a replacement for the entire file.
// Add ONLY the lines marked with ← ADD to your existing report-client.tsx.
// The surrounding lines are shown for context only (do not duplicate them).
//
// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — Add these two imports at the top of the file,
//             after the existing "use client" directive and import block.
// ─────────────────────────────────────────────────────────────────────────────
//
//   import { useExportPdf } from "@/hooks/use-export-pdf";            // ← ADD
//   import { ExportPdfButton } from "./export-pdf-button";            // ← ADD
//
// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — Inside ReportClient(), after the useAuditReport() call,
//             add the hook call:
// ─────────────────────────────────────────────────────────────────────────────
//
//   const { report, isLoading, isError, errorMessage, mutate } = useAuditReport(auditId);
//
//   const { status: pdfStatus, error: pdfError, isGenerating, exportPdf, reset: resetPdf }
//     = useExportPdf(report);                                         // ← ADD
//
// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — Inside the JSX return, add <ExportPdfButton> to the
//             ReportHeader section.  The recommended placement is between
//             <ReportHeader> and <OverallScoreSection> — i.e. right after
//             the header closes and before the first data section.
//
//             Replace this existing block:
//
//               <ReportHeader
//                 url={report.url}
//                 auditId={report.auditId}
//                 completedAt={report.completedAt}
//               />
//
//             With:
//
//               <div className="flex items-start justify-between gap-4 flex-wrap">
//                 <ReportHeader
//                   url={report.url}
//                   auditId={report.auditId}
//                   completedAt={report.completedAt}
//                 />
//                 <ExportPdfButton                                      // ← ADD
//                   status={pdfStatus}                                  // ← ADD
//                   error={pdfError}                                    // ← ADD
//                   onClick={exportPdf}                                 // ← ADD
//                   onRetry={exportPdf}                                 // ← ADD
//                 />                                                    // ← ADD
//               </div>
//
// ─────────────────────────────────────────────────────────────────────────────
//
// That is all.  No other changes needed.
// The full modified file is shown below for reference — copy this version
// over the existing report-client.tsx if a full replacement is easier.

// ── Full replacement version ──────────────────────────────────────────────────

"use client";

import { useAuditReport } from "@/hooks/use-audit-report";
import { useExportPdf } from "@/hooks/use-export-pdf";

import { ReportHeader } from "./report-header";
import { OverallScoreSection } from "./overall-score-section";
import { CategoryScoresSection } from "./category-scores-section";
import { RecommendationsSection } from "./recommendations-section";
import { ScreenshotSection } from "./screenshot-section";
import { AuditMetadataSection } from "./audit-metadata-section";
import { ReportLoadingSkeleton } from "./report-loading-skeleton";
import { ReportEmptyState } from "./report-empty-state";
import { ReportErrorState } from "./report-error-state";
import dynamic from "next/dynamic";
const ExportPdfButton = dynamic(
  () =>
    import("./export-pdf-button").then((m) => ({
      default: m.ExportPdfButton,
    })),
  {
    ssr: false,
  }
);

interface ReportClientProps {
  auditId: string;
}

export function ReportClient({ auditId }: ReportClientProps) {
  const { report, isLoading, isError, errorMessage, mutate } =
    useAuditReport(auditId);

  // PDF export hook — reads the same `report` object, no extra fetch
  const { status: pdfStatus, error: pdfError, exportPdf } = useExportPdf(report);

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
      {/* Header row — title left, Export PDF button right */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <ReportHeader
          url={report.url}
          auditId={report.auditId}
          completedAt={report.completedAt}
        />
        <ExportPdfButton
          status={pdfStatus}
          error={pdfError}
          onClick={exportPdf}
          onRetry={exportPdf}
        />
      </div>

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
