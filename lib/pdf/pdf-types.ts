// lib/pdf/pdf-types.ts
//
// Shared types for the PDF export feature.
// Kept separate so the hook and document component can import
// the same shape without circular dependencies.

export type PdfExportStatus = "idle" | "generating" | "completed" | "failed";

export interface PdfExportState {
  status: PdfExportStatus;
  error: string | null;
}
