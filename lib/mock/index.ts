// lib/mock/index.ts
//
// The ONLY public export surface of the entire mock layer.
// Everything outside lib/mock/ imports only from here.
// This is the boundary that prevents mock knowledge from leaking.

export { MockAuditStore } from "./engines/mock-audit-store";
export { MockAuditEngine } from "./engines/mock-audit-engine";
export { MockScreenshotProvider } from "./engines/mock-screenshot-provider";
export { MockStorageProvider } from "./engines/mock-storage-provider";
export { MockReportGenerator } from "./generators/mock-report-generator";
export { MockRecommendationGenerator } from "./generators/mock-recommendation-generator";