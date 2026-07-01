// lib/interfaces/i-audit-event-store.ts
//
// Contract for persisting and retrieving audit lifecycle events.
// Kept separate from IAuditStore — events are an append-only log with
// different read patterns (list by auditId, ordered by time) vs the
// point-lookup / upsert pattern of IAuditStore.
//
// Step 8.9: satisfied by SupabaseAuditEventStore (writes to audit_events table).
// Fallback: MockAuditEventStore (in-process array, used when Supabase env vars absent).
//
// Stage values mirror the pipeline stages defined in LighthouseAuditEngine
// and the pipeline stage definitions used for the status response.

export type AuditEventStage =
  | "queued"
  | "processing"
  | "lighthouse"
  | "screenshots"
  | "report_generation"
  | "completed"
  | "failed";

export interface AuditEvent {
  id: string;
  auditId: string;
  stage: AuditEventStage;
  /** Optional human-readable detail, e.g. error message on "failed" */
  message: string | null;
  /** 0-based order within the audit's event sequence */
  stageIndex: number;
  createdAt: string; // ISO-8601
}

export interface IAuditEventStore {
  /**
   * Append a new event to the audit's timeline.
   * Non-blocking in the caller — implementations should be fire-and-forget
   * friendly (errors logged, not thrown upward to the user request).
   */
  emit(
    auditId: string,
    stage: AuditEventStage,
    message?: string,
  ): Promise<void>;

  /**
   * Retrieve all events for an audit, ordered by createdAt ascending.
   * Returns an empty array if the audit has no events or does not exist.
   */
  listByAuditId(auditId: string): Promise<AuditEvent[]>;
}
