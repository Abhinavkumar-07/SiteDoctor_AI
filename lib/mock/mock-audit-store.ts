// lib/mock/mock-audit-store.ts
//
// In-process store for mock audit records.
//
// Why globalThis?
// Next.js hot-reload re-evaluates module files on every save, which would
// wipe a plain `const store = new Map()` and cause "audit not found" errors
// during development.  Attaching to globalThis persists the Map across
// hot-reloads in the Node.js process — the same pattern used by Prisma's
// singleton client recommendation.
//
// In production (Step 8.2+) this entire file is deleted and replaced with
// real Supabase queries.  The service layer is the only consumer; route
// handlers never import this directly.

import type { AuditRecord } from "@/lib/types/audit-api";

const GLOBAL_KEY = "__sitedoctor_audit_store__";

declare global {
  // eslint-disable-next-line no-var
  var __sitedoctor_audit_store__: Map<string, AuditRecord> | undefined;
}

function getStore(): Map<string, AuditRecord> {
  if (!globalThis[GLOBAL_KEY]) {
    globalThis[GLOBAL_KEY] = new Map<string, AuditRecord>();
  }
  return globalThis[GLOBAL_KEY]!;
}

export const auditStore = {
  set(record: AuditRecord): void {
    getStore().set(record.auditId, record);
  },

  get(auditId: string): AuditRecord | undefined {
    return getStore().get(auditId);
  },

  has(auditId: string): boolean {
    return getStore().has(auditId);
  },

  /** Find the first record whose shareToken matches. */
  findByShareToken(token: string): AuditRecord | undefined {
    for (const record of getStore().values()) {
      if (record.shareToken === token) return record;
    }
    return undefined;
  },

  size(): number {
    return getStore().size;
  },
};
