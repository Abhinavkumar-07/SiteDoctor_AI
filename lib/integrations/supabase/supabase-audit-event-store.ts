// lib/integrations/supabase/supabase-audit-event-store.ts
//
// Implements IAuditEventStore using the Supabase `audit_events` table.
//
// Table schema (from migration 001, enhanced by migration 003):
//   id           uuid pk
//   audit_id     text  FK → audits(audit_id) ON DELETE CASCADE
//   stage        text
//   message      text  (nullable — added in migration 003)
//   stage_index  int   (nullable — added in migration 003)
//   created_at   timestamptz
//
// emit() is intentionally non-throwing: event persistence failures are
// logged but never surfaced to the user request. Events are observability
// data — a write failure must not break the audit flow.

import type {
  IAuditEventStore,
  AuditEvent,
  AuditEventStage,
} from "@/lib/interfaces/i-audit-event-store";
import { getSupabaseClient } from "./supabase-client";

// ── DB row type ───────────────────────────────────────────────────────────────

interface AuditEventRow {
  id: string;
  audit_id: string;
  stage: string;
  message: string | null;
  stage_index: number | null;
  created_at: string;
}

function rowToEvent(row: AuditEventRow): AuditEvent {
  return {
    id: row.id,
    auditId: row.audit_id,
    stage: row.stage as AuditEventStage,
    message: row.message,
    stageIndex: row.stage_index ?? 0,
    createdAt: row.created_at,
  };
}

// ── SupabaseAuditEventStore ───────────────────────────────────────────────────

export class SupabaseAuditEventStore implements IAuditEventStore {
  private get db() {
    return getSupabaseClient();
  }

  async emit(
    auditId: string,
    stage: AuditEventStage,
    message?: string,
  ): Promise<void> {
    try {
      // Derive stage_index from existing event count — avoids a SELECT by
      // using the insert timestamp ordering for retrieval instead.
      // stage_index is a convenience field for display ordering only.
      const { count } = await this.db
        .from("audit_events")
        .select("*", { count: "exact", head: true })
        .eq("audit_id", auditId);

      const { error } = await this.db.from("audit_events").insert({
        audit_id: auditId,
        stage,
        message: message ?? null,
        stage_index: count ?? 0,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error(
          `[SupabaseAuditEventStore] emit failed for ${auditId}/${stage}:`,
          error.message,
        );
        // Non-throwing: event failure never breaks audit flow
      }
    } catch (err) {
      console.error(
        `[SupabaseAuditEventStore] Unexpected error emitting ${stage} for ${auditId}:`,
        err,
      );
    }
  }

  async listByAuditId(auditId: string): Promise<AuditEvent[]> {
    const { data, error } = await this.db
      .from("audit_events")
      .select("*")
      .eq("audit_id", auditId)
      .order("created_at", { ascending: true })
      .returns<AuditEventRow[]>();

    if (error) {
      console.error(
        `[SupabaseAuditEventStore] listByAuditId failed for ${auditId}:`,
        error.message,
      );
      return [];
    }

    return (data ?? []).map(rowToEvent);
  }
}
