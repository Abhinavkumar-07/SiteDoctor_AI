// lib/interfaces/index.ts
// Re-export all interfaces from a single entry point.
// Services and repositories import from here — never from individual files.

export type { IAuditStore } from "./i-audit-store";
export type { IAuditEngine } from "./i-audit-engine";
export type { IScreenshotProvider, ScreenshotResult } from "./i-screenshot-provider";
export type { IReportGenerator, RawAnalysisInput, GeneratedReport } from "./i-report-generator";
export type { IRecommendationGenerator } from "./i-recommendation-generator";
export type { IStorageProvider, UploadResult } from "./i-storage-provider";
