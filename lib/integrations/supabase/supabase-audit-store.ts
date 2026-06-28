// lib/integrations/supabase/supabase-audit-store.ts
//
// Implements IAuditStore using the Supabase `audits` table.
// Replaces MockAuditStore in the container from Step 8.6 onwards.
//
// Table: audits
//   id            uuid pk
//   audit_id      text unique
//   url           text
//   share_token   text
//   status        text  (queued | processing | completed | failed)
//   overall_score integer  (null until report is persisted)
//   overall_grade text     (null until report is persisted)
//   created_at    timestamptz
//   completed_at  timestamptz (null until completed)
//   updated_at    timestamptz

import type { IAuditStore } from "@/lib/interfaces/i-audit-store";
import type { AuditRecord } from "@/lib/types/audit-api";
import { getSupabaseClient } from "./supabase-client";
import { Errors } from "@/lib/types/api-errors";

// ── DB row shape (matches Supabase table exactly) ──────────────────────────

interface AuditRow {
  id: string;
  audit_id: string;
  url: string;
  share_token: string;
  status: string;
  overall_score: number | null;
  overall_grade: string | null;
  created_at: string;
  completed_at: string | null;
  updated_at: string;
}

function rowToRecord(row: AuditRow): AuditRecord {
  return {
    auditId: row.audit_id,
    url: row.url,
    createdAt: row.created_at,
    shareToken: row.share_token,
  };
}

// ── SupabaseAuditStore ────────────────────────────────────────────────────────

export class SupabaseAuditStore implements IAuditStore {
  private get db() {
    return getSupabaseClient();
  }

  async save(record: AuditRecord): Promise<void> {
    const { error } = await this.db.from("audits").upsert(
      {
        audit_id: record.auditId,
        url: record.url,
        share_token: record.shareToken,
        status: "queued",
        created_at: record.createdAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "audit_id" },
    );

    if (error) {
      console.error("[SupabaseAuditStore] save failed:", error.message);
      throw Errors.internal(`Failed to persist audit: ${error.message}`);
    }
  }

  async findById(auditId: string): Promise<AuditRecord | undefined> {
    const { data, error } = await this.db
      .from("audits")
      .select("*")
      .eq("audit_id", auditId)
      .maybeSingle<AuditRow>();

    if (error) {
      console.error("[SupabaseAuditStore] findById failed:", error.message);
      throw Errors.internal(`Failed to fetch audit: ${error.message}`);
    }

    return data ? rowToRecord(data) : undefined;
  }

  async findByShareToken(token: string): Promise<AuditRecord | undefined> {
    const { data, error } = await this.db
      .from("audits")
      .select("*")
      .eq("share_token", token)
      .maybeSingle<AuditRow>();

    if (error) {
      console.error("[SupabaseAuditStore] findByShareToken failed:", error.message);
      throw Errors.internal(`Failed to fetch audit by token: ${error.message}`);
    }

    return data ? rowToRecord(data) : undefined;
  }

  /**
   * Update the audit row after report completion.
   * Called by SupabaseReportStore.save() — not part of IAuditStore,
   * but kept here to keep all `audits` table mutations in one file.
   */
  async markCompleted(
    auditId: string,
    overallScore: number,
    overallGrade: string,
  ): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await this.db
      .from("audits")
      .update({
        status: "completed",
        overall_score: overallScore,
        overall_grade: overallGrade,
        completed_at: now,
        updated_at: now,
      })
      .eq("audit_id", auditId);

    if (error) {
      console.error("[SupabaseAuditStore] markCompleted failed:", error.message);
      // Non-fatal — report is already persisted, status update is cosmetic
    }
  }

  /** Used by dashboard list endpoint */
  async listRecent(
    limit: number,
    offset: number,
    search?: string,
    minScore?: number,
  ): Promise<{ records: AuditRecord[]; total: number }> {
    let query = this.db
      .from("audits")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike("url", `%${search}%`);
    }

    if (minScore !== undefined) {
      query = query.gte("overall_score", minScore);
    }

    const { data, error, count } = await query.returns<AuditRow[]>();

    if (error) {
      console.error("[SupabaseAuditStore] listRecent failed:", error.message);
      throw Errors.internal(`Failed to list audits: ${error.message}`);
    }

    return {
      records: (data ?? []).map(rowToRecord),
      total: count ?? 0,
    };
  }

  /** Used by dashboard delete action */
  async deleteById(auditId: string): Promise<void> {
    const { error } = await this.db
      .from("audits")
      .delete()
      .eq("audit_id", auditId);

    if (error) {
      console.error("[SupabaseAuditStore] deleteById failed:", error.message);
      throw Errors.internal(`Failed to delete audit: ${error.message}`);
    }
  }
}
