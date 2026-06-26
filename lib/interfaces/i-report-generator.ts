// lib/interfaces/i-report-generator.ts
//
// Contract for generating the structured report body from raw analysis data.
// In Step 8.1–8.2: MockReportGenerator seeds scores deterministically from URL.
// In Step 8.3+: LighthouseReportGenerator processes real Lighthouse JSON.

import type { CategoryScore, Recommendation, Screenshots } from "@/lib/types/audit-api";

export interface RawAnalysisInput {
  url: string;
  auditId: string;
  lighthouseJson?: unknown;      // populated in Step 8.3+
  screenshots: Screenshots;
}

export interface GeneratedReport {
  overallScore: number;
  overallGrade: string;
  summary: string;
  categories: CategoryScore[];
  recommendations: Recommendation[];
  screenshots: Screenshots;
  metadata: {
    lighthouseVersion: string;
    userAgent: string;
    fetchTime: string;
    environment: string;
  };
}

export interface IReportGenerator {
  generate(input: RawAnalysisInput): Promise<GeneratedReport>;
}
