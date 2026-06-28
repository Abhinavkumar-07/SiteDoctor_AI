// lib/integrations/supabase/supabase-report-store.ts
//
// Implements IReportStore using the Supabase `audit_reports` table.
// Also calls SupabaseAuditStore.markCompleted() so the parent `audits` row
// reflects the final score and grade — keeping both tables consistent.
//
// Table: audit_reports
//   id               uuid pk
//   audit_id         text  (FK → audits.audit_id, cascade delete)
//   summary          text
//   metadata         jsonb
//   screenshots      jsonb
//   categories       jsonb
//   recommendations  jsonb
//   raw_lhr          jsonb (nullable)
//   created_at       timestamptz

import type { IReportStore } from "@/lib/interfaces/i-report-store";
import type { AuditReportResponse } from "@/lib/types/audit-api";
import { getSupabaseClient } from "./supabase-client";
import { SupabaseAuditStore } from "./supabase-audit-store";
import { Errors } from "@/lib/types/api-errors";

// ── DB row shape ──────────────────────────────────────────────────────────────

interface ReportRow {
  id: string;
  audit_id: string;
  summary: string | null;
  metadata: AuditReportResponse["metadata"] | null;
  screenshots: AuditReportResponse["screenshots"] | null;
  categories: AuditReportResponse["categories"] | null;
  recommendations: AuditReportResponse["recommendations"] | null;
  raw_lhr: unknown | null;
  created_at: string;
}

function rowToReport(row: ReportRow, auditId: string, url: string): AuditReportResponse {
  return {
    auditId,
    url,
    completedAt: row.created_at,
    overallScore: (row.categories ?? []).reduce(
      (sum, c) => sum + (c.score ?? 0),
      0,
    ) || 0, // recalculated below from categories
    overallGrade: "B", // placeholder — overridden below
    summary: row.summary ?? "",
    categories: row.categories ?? [],
    recommendations: row.recommendations ?? [],
    screenshots: row.screenshots ?? { desktopUrl: null, mobileUrl: null },
    metadata: row.metadata ?? {
      lighthouseVersion: "",
      userAgent: "",
      fetchTime: row.created_at,
      environment: "supabase",
    },
  };
}

// ── SupabaseReportStore ───────────────────────────────────────────────────────

export class SupabaseReportStore implements IReportStore {
  private readonly auditStore = new SupabaseAuditStore();

  private get db() {
    return getSupabaseClient();
  }

  async save(report: AuditReportResponse, rawLhr?: unknown): Promise<void> {
    // Upsert the report row
    const { error } = await this.db.from("audit_reports").upsert(
      {
        audit_id: report.auditId,
        summary: report.summary,
        metadata: report.metadata,
        screenshots: report.screenshots,
        categories: report.categories,
        recommendations: report.recommendations,
        raw_lhr: rawLhr ?? null,
        created_at: report.completedAt,
      },
      { onConflict: "audit_id" },
    );

    if (error) {
      console.error("[SupabaseReportStore] save failed:", error.message);
      throw Errors.internal(`Failed to persist report: ${error.message}`);
    }

    // Update parent audits row with score + grade + completed status
    await this.auditStore.markCompleted(
      report.auditId,
      report.overallScore,
      report.overallGrade,
    );
  }

  async findByAuditId(auditId: string): Promise<AuditReportResponse | null> {
    // We need the url from the audits table — join via audit_id
    const { data: auditRow, error: auditError } = await this.db
      .from("audits")
      .select("url")
      .eq("audit_id", auditId)
      .maybeSingle<{ url: string }>();

    if (auditError || !auditRow) return null;

    const { data, error } = await this.db
      .from("audit_reports")
      .select("*")
      .eq("audit_id", auditId)
      .maybeSingle<ReportRow>();

    if (error) {
      console.error("[SupabaseReportStore] findByAuditId failed:", error.message);
      return null;
    }

    if (!data) return null;

    // Reconstruct AuditReportResponse from stored JSONB
    const report = rowToReport(data, auditId, auditRow.url);

    // Re-attach the stored overall score/grade from the audits table
    const { data: scoreRow } = await this.db
      .from("audits")
      .select("overall_score, overall_grade")
      .eq("audit_id", auditId)
      .maybeSingle<{ overall_score: number; overall_grade: string }>();

    if (scoreRow) {
      report.overallScore = scoreRow.overall_score;
      report.overallGrade = scoreRow.overall_grade as AuditReportResponse["overallGrade"];
    }

    return report;
  }

  async deleteByAuditId(auditId: string): Promise<void> {
    // Cascade delete on the DB handles audit_reports deletion.
    // We delete from audits — the FK cascade removes the report row.
    await this.auditStore.deleteById(auditId);
  }
}
