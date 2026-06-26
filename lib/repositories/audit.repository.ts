// lib/repositories/audit.repository.ts
//
// Repository for AuditRecord persistence.
// Services call methods here; this class translates them into
// IAuditStore operations.  When Supabase arrives, only the store
// implementation changes — this repository's API is stable.

import type { IAuditStore } from "@/lib/interfaces/i-audit-store";
import type { AuditRecord } from "@/lib/types/audit-api";
import { Errors } from "@/lib/types/api-errors";

export class AuditRepository {
  constructor(private readonly store: IAuditStore) {}

  async save(record: AuditRecord): Promise<void> {
    await this.store.save(record);
  }

  async getById(auditId: string): Promise<AuditRecord> {
    const record = await this.store.findById(auditId);
    if (!record) throw Errors.notFound(`Audit ${auditId}`);
    return record;
  }

  async findById(auditId: string): Promise<AuditRecord | undefined> {
    return this.store.findById(auditId);
  }
}
