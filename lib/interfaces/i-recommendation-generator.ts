// lib/interfaces/i-recommendation-generator.ts
//
// Contract for generating prioritised recommendations.
// In Step 8.1–8.2: MockRecommendationGenerator returns a static bank.
// In Step 8.4+: GeminiRecommendationGenerator calls the Gemini AI API.

import type { Recommendation } from "@/lib/types/audit-api";
import type { GeneratedReport } from "./i-report-generator";

export interface IRecommendationGenerator {
  /**
   * Produce prioritised recommendations from the analysed report data.
   * Called after the report is generated; may use AI to enrich suggestions.
   */
  generate(report: GeneratedReport, url: string): Promise<Recommendation[]>;
}
