// lib/mock/engines/mock-audit-store.ts
//
// Satisfies IAuditStore using an in-process Map.
// Persists across Next.js hot-reloads via globalThis.
// Replaced by SupabaseAuditStore in Step 8.3+.

import type { IAuditStore } from "@/lib/interfaces/i-audit-store";
import type { AuditRecord } from "@/lib/types/audit-api";

const GLOBAL_KEY = "__sitedoctor_audit_store_v2__";

declare global {
  // eslint-disable-next-line no-var
  var __sitedoctor_audit_store_v2__: Map<string, AuditRecord> | undefined;
}

function getMap(): Map<string, AuditRecord> {
  if (!globalThis[GLOBAL_KEY]) {
    globalThis[GLOBAL_KEY] = new Map<string, AuditRecord>();
  }
  return globalThis[GLOBAL_KEY]!;
}

export class MockAuditStore implements IAuditStore {
  async save(record: AuditRecord): Promise<void> {
    console.log("SAVE", record.auditId);
    getMap().set(record.auditId, record);
    console.log("STORE SIZE", getMap().size);
  }

  async findById(auditId: string): Promise<AuditRecord | undefined> {
    console.log("FIND", auditId);
    console.log("STORE SIZE", getMap().size);
    return getMap().get(auditId);
  }

  async findByShareToken(token: string): Promise<AuditRecord | undefined> {
    for (const record of getMap().values()) {
      if (record.shareToken === token) return record;
    }
    return undefined;
  }
}