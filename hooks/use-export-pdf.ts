// hooks/use-export-pdf.ts
//
// Handles the full PDF export lifecycle:
//   idle → generating → completed | failed
//
// @react-pdf/renderer is imported DYNAMICALLY (lazy) so it does NOT
// enter the initial JS bundle.  The ~400 KB library is only fetched when
// the user first clicks "Export PDF".
//
// ── Future server-side migration ─────────────────────────────────────────────
// To replace client-side generation with a server-side route:
//   1. Remove the dynamic import of AuditReportPdf below.
//   2. Replace the `pdf(…).toBlob()` call with:
//        const res = await fetch(`/api/v1/reports/${report.auditId}/pdf`);
//        const blob = await res.blob();
//   3. The rest of this hook (state, download trigger, error handling)
//      stays exactly the same.
// The ExportPdfButton component doesn't need to change at all.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useCallback, useReducer } from "react";
import type { AuditReport } from "@/lib/types/audit-report";
import type { PdfExportState, PdfExportStatus } from "@/lib/pdf/pdf-types";

// ── State machine ─────────────────────────────────────────────────────────────

type Action =
  | { type: "START" }
  | { type: "DONE" }
  | { type: "FAIL"; error: string }
  | { type: "RESET" };

const INITIAL_STATE: PdfExportState = { status: "idle", error: null };

function reducer(state: PdfExportState, action: Action): PdfExportState {
  switch (action.type) {
    case "START": return { status: "generating", error: null };
    case "DONE":  return { status: "completed",  error: null };
    case "FAIL":  return { status: "failed",     error: action.error };
    case "RESET": return INITIAL_STATE;
    default:      return state;
  }
}

// ── Browser capability check ──────────────────────────────────────────────────

function checkBrowserSupport(): string | null {
  if (typeof window === "undefined") return "PDF export requires a browser environment.";
  if (typeof Blob === "undefined")   return "Your browser does not support PDF export (Blob API missing).";
  if (typeof URL?.createObjectURL === "undefined")
    return "Your browser does not support PDF export (URL.createObjectURL missing).";
  return null;
}

// ── Filename helper ───────────────────────────────────────────────────────────

function buildFilename(report: AuditReport): string {
  let host = report.url;
  try { host = new URL(report.url).hostname; } catch { /* keep raw */ }
  const date = new Date(report.completedAt).toISOString().slice(0, 10);
  // Sanitise: replace anything that isn't alphanumeric, dot, or dash
  const safe = host.replace(/[^a-z0-9.-]/gi, "_");
  return `sitedoctor-${safe}-${date}.pdf`;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

interface UseExportPdfResult {
  status: PdfExportStatus;
  error: string | null;
  isGenerating: boolean;
  exportPdf: () => Promise<void>;
  reset: () => void;
}

export function useExportPdf(report: AuditReport | undefined): UseExportPdfResult {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const exportPdf = useCallback(async () => {
    if (!report) {
      dispatch({ type: "FAIL", error: "No report data available." });
      return;
    }

    // Browser support guard
    const unsupported = checkBrowserSupport();
    if (unsupported) {
      dispatch({ type: "FAIL", error: unsupported });
      return;
    }

    dispatch({ type: "START" });

    try {
      // ── Lazy-load @react-pdf/renderer ─────────────────────────────────────
      // Both the renderer primitives and our document component are imported
      // here, ensuring they are never part of the initial bundle.
      const [{ pdf }, { AuditReportPdf }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/lib/pdf/audit-report-pdf"),
      ]);

      // ── Generate PDF blob ─────────────────────────────────────────────────
      const element = AuditReportPdf({ report });
      const blob = await pdf(element).toBlob();

      // ── Trigger browser download ──────────────────────────────────────────
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = buildFilename(report);
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      // Cleanup after next tick
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);

      dispatch({ type: "DONE" });

      // Auto-reset to idle after 4 s so the button can be used again
      setTimeout(() => dispatch({ type: "RESET" }), 4000);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "PDF generation failed. Please try again.";
      dispatch({ type: "FAIL", error: msg });
    }
  }, [report]);

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return {
    status: state.status,
    error: state.error,
    isGenerating: state.status === "generating",
    exportPdf,
    reset,
  };
}
