// lib/mock/generators/mock-recommendation-generator.ts
//
// Satisfies IRecommendationGenerator by returning the recommendations that are
// already embedded in the mock report data — no AI call needed.
// Replaced by GeminiRecommendationGenerator in Step 8.4+.

import type { IRecommendationGenerator } from "@/lib/interfaces/i-recommendation-generator";
import type { Recommendation } from "@/lib/types/audit-api";
import type { GeneratedReport } from "@/lib/interfaces/i-report-generator";

export class MockRecommendationGenerator
  implements IRecommendationGenerator
{
  async generate(
    report: GeneratedReport,
    _url: string,
  ): Promise<Recommendation[]> {
    // The mock report already contains recommendations; return them as-is.
    return report.recommendations;
  }
}
