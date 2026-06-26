// lib/mock/generators/mock-report-generator.ts
//
// Satisfies IReportGenerator by delegating to the pure mock-report-data
// builder.  The interface layer means nothing in the pipeline knows or cares
// that this is a mock — it just calls generate() and gets a GeneratedReport.
// Replaced by LighthouseReportGenerator in Step 8.3+.

import type {
  IReportGenerator,
  RawAnalysisInput,
  GeneratedReport,
} from "@/lib/interfaces/i-report-generator";
import { buildMockReport } from "./mock-report-data";

export class MockReportGenerator implements IReportGenerator {
  async generate(input: RawAnalysisInput): Promise<GeneratedReport> {
    // Pull what we need from the input; ignore lighthouseJson (not yet real)
    const report = buildMockReport(
      input.auditId,
      input.url,
      new Date().toISOString(),
    );

    return {
      overallScore: report.overallScore,
      overallGrade: report.overallGrade,
      summary: report.summary,
      categories: report.categories,
      recommendations: report.recommendations,
      screenshots: input.screenshots,
      metadata: report.metadata,
    };
  }
}
