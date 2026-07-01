// lib/mock/engines/mock-audit-event-store.ts
//
// Satisfies IAuditEventStore using an in-process Map of arrays.
// Persists across hot-reloads via globalThis.
// Used when Supabase env vars are absent (local dev without DB).

import type {
  IAuditEventStore,
  AuditEvent,
  AuditEventStage,
} from "@/lib/interfaces/i-audit-event-store";

const GLOBAL_KEY = "__sitedoctor_mock_event_store__";

declare global {
  // eslint-disable-next-line no-var
  var __sitedoctor_mock_event_store__:
    | Map<string, AuditEvent[]>
    | undefined;
}

function getMap(): Map<string, AuditEvent[]> {
  if (!globalThis[GLOBAL_KEY]) {
    globalThis[GLOBAL_KEY] = new Map<string, AuditEvent[]>();
  }
  return globalThis[GLOBAL_KEY]!;
}

export class MockAuditEventStore implements IAuditEventStore {
  async emit(
    auditId: string,
    stage: AuditEventStage,
    message?: string,
  ): Promise<void> {
    const map = getMap();
    const events = map.get(auditId) ?? [];
    events.push({
      id: `mock_event_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      auditId,
      stage,
      message: message ?? null,
      stageIndex: events.length,
      createdAt: new Date().toISOString(),
    });
    map.set(auditId, events);
  }

  async listByAuditId(auditId: string): Promise<AuditEvent[]> {
    return getMap().get(auditId) ?? [];
  }
}
