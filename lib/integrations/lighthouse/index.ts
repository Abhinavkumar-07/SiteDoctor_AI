// lib/integrations/lighthouse/index.ts
//
// Public surface of the Lighthouse integration module.
// Only these exports are imported by the container and any future
// Lighthouse-aware pipeline stages.
// Internal helpers (runner config, parser details) are not re-exported.

export { LighthouseAuditEngine } from "./lighthouse-audit-engine";

// Parser utilities exported for unit tests and future Gemini integration
export {
  extractCategoryScores,
  extractRawOpportunities,
  buildRecommendationsFromOpportunities,
  extractMetadata,
  computeOverallScore,
  buildOverallSummary,
  scoreToGrade,
} from "./lighthouse-report-parser";
export type {
  RawOpportunity,
  LighthouseMetadata,
} from "./lighthouse-report-parser";

export { runLighthouse } from "./lighthouse-runner";
export type { LighthouseRunResult, LighthouseRunOptions } from "./lighthouse-runner";
