// lib/pipeline/stages/store-result.ts
//
// Pipeline stage 4: Persist the audit record so future status and report
// requests can look it up.
// In Step 8.1–8.2 the store is an in-process Map.
// In Step 8.3+ it is a Supabase insert — zero change here.

import type { IAuditStore } from "@/lib/interfaces/i-audit-store";
import type { AuditRecord } from "@/lib/types/audit-api";

export async function storeResult(
  record: AuditRecord,
  store: IAuditStore,
): Promise<void> {
  await store.save(record);
}
