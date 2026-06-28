// lib/integrations/supabase/supabase-dashboard-store.ts
//
// Implements IDashboardStore using a JOIN between audits + audit_reports.
// All dashboard queries are in one place — no scattered raw SQL elsewhere.
//
// list() — paginated, filterable audit index
// deleteAudit() — cascade delete via the audits FK

import type {
  IDashboardStore,
  DashboardAuditRow,
  DashboardListOptions,
  DashboardListResult,
} from "@/lib/interfaces/i-dashboard-store";
import { getSupabaseClient } from "./supabase-client";
import { Errors } from "@/lib/types/api-errors";

// ── DB row type returned by the join query ────────────────────────────────────

interface AuditJoinRow {
  audit_id: string;
  url: string;
  share_token: string;
  status: string;
  overall_score: number | null;
  overall_grade: string | null;
  created_at: string;
  completed_at: string | null;

  audit_reports: {
    screenshots: {
      desktopUrl: string | null;
      mobileUrl: string | null;
    } | null;
  } | null;
}

function rowToDashboardRow(row: AuditJoinRow): DashboardAuditRow {

  const screenshotUrl =
    row.audit_reports?.screenshots?.desktopUrl ?? null;

  return {
    auditId: row.audit_id,
    url: row.url,
    shareToken: row.share_token,
    status: row.status,
    overallScore: row.overall_score,
    overallGrade: row.overall_grade,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    screenshotUrl,
  };
}

export class SupabaseDashboardStore implements IDashboardStore {
  private get db() {
    return getSupabaseClient();
  }

  async list(options: DashboardListOptions): Promise<DashboardListResult> {
    const { page, limit, search, minScore } = options;
    const offset = (page - 1) * limit;

    // Build query: left-join audit_reports for screenshot URL
    let query = this.db
      .from("audits")
      .select(
        `
        audit_id,
        url,
        share_token,
        status,
        overall_score,
        overall_grade,
        created_at,
        completed_at,
        audit_reports ( screenshots )
        `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike("url", `%${search}%`);
    }

    if (minScore !== undefined) {
      query = query.gte("overall_score", minScore);
    }

    const { data, error, count } = await query.returns<AuditJoinRow[]>();

  
    if (error) {
      console.error("[SupabaseDashboardStore] list failed:", error.message);
      throw Errors.internal(`Failed to list audits: ${error.message}`);
    }

    return {
      rows: (data ?? []).map(rowToDashboardRow),
      total: count ?? 0,
    };
  }

  async deleteAudit(auditId: string): Promise<void> {
    const { error } = await this.db
      .from("audits")
      .delete()
      .eq("audit_id", auditId);

    if (error) {
      console.error("[SupabaseDashboardStore] deleteAudit failed:", error.message);
      throw Errors.internal(`Failed to delete audit: ${error.message}`);
    }
    // FK cascade handles audit_reports deletion automatically
  }
}
