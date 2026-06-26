// lib/pipeline/stages/generate-report.ts
//
// Pipeline stage 3: Report generation.
// Feeds raw analysis input into IReportGenerator, then enriches recommendations
// via IRecommendationGenerator.  Both are injected — no concrete class known here.

import type { IReportGenerator } from "@/lib/interfaces/i-report-generator";
import type { IRecommendationGenerator } from "@/lib/interfaces/i-recommendation-generator";
import type { RawAnalysisInput, GeneratedReport } from "@/lib/interfaces/i-report-generator";

export async function generateReport(
  input: RawAnalysisInput,
  reportGenerator: IReportGenerator,
  recommendationGenerator: IRecommendationGenerator,
): Promise<GeneratedReport> {
  const report = await reportGenerator.generate(input);

  // Allow the recommendation generator to enrich or replace the initial set
  const recommendations = await recommendationGenerator.generate(
    report,
    input.url,
  );

  return { ...report, recommendations };
}
