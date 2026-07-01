// lib/mock/index.ts
//
// The ONLY public export surface of the mock layer.
// Everything outside lib/mock/ imports only from here.
//
// Step 8.3 addition:
//   buildMockReport is exported so PlaywrightAuditEngine can use mock scores
//   until Lighthouse integration lands in Step 8.4.
//   Once LighthouseAuditEngine replaces PlaywrightAuditEngine in the container,
//   the buildMockReport export here can be removed.

export { MockAuditStore } from "./engines/mock-audit-store";
export { MockAuditEngine } from "./engines/mock-audit-engine";
export { MockScreenshotProvider } from "./engines/mock-screenshot-provider";
export { MockStorageProvider } from "./engines/mock-storage-provider";
export { MockReportGenerator } from "./generators/mock-report-generator";
export { MockRecommendationGenerator } from "./generators/mock-recommendation-generator";

// Transitional export — remove in Step 8.4 when real Lighthouse scores replace mock data
export { buildMockReport } from "./generators/mock-report-data";
export { MockReportStore } from "./engines/mock-report-store";
export { MockDashboardStore } from "./engines/mock-dashboard-store";
export { MockAuditEventStore }
from "./engines/mock-audit-event-store";