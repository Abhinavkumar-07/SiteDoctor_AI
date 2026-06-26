// lib/interfaces/i-audit-store.ts
//
// Contract for persisting and retrieving AuditRecord objects.
// In Step 8.1 this is satisfied by an in-process Map.
// In Step 8.3+ it is satisfied by a Supabase client.
//
// Rule: nothing outside lib/mock/ may import a concrete store implementation.
// Everything else imports and depends only on this interface.

import type { AuditRecord } from "@/lib/types/audit-api";

export interface IAuditStore {
  /** Persist a new audit record. */
  save(record: AuditRecord): Promise<void>;

  /** Retrieve a record by its auditId. Returns undefined if not found. */
  findById(auditId: string): Promise<AuditRecord | undefined>;

  /** Retrieve a record by its shareToken. Returns undefined if not found. */
  findByShareToken(shareToken: string): Promise<AuditRecord | undefined>;
}
