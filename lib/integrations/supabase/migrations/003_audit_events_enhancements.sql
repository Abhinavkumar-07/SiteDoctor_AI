-- supabase/migrations/003_audit_events_enhancements.sql
--
-- Step 8.9: enhance the audit_events table created in migration 001.
-- The base table (id, audit_id, stage, created_at) already exists.
-- This migration adds two new nullable columns:
--   message      — human-readable detail, e.g. error message on "failed"
--   stage_index  — 0-based order within the audit's event sequence
--
-- All changes are additive (ADD COLUMN IF NOT EXISTS) — safe to run on a
-- live database with existing rows (new columns default to NULL for old rows).
--
-- Also ensures the FK to audits(audit_id) exists with CASCADE DELETE.

-- ── Add message column ────────────────────────────────────────────────────────
alter table public.audit_events
  add column if not exists message text;

-- ── Add stage_index column ────────────────────────────────────────────────────
alter table public.audit_events
  add column if not exists stage_index integer;

-- ── Ensure FK with CASCADE DELETE (idempotent guard) ─────────────────────────
-- The FK may already exist from migration 001; this block only adds it if
-- it is somehow absent (e.g. manual table creation without the constraint).
do $$
begin
  if not exists (
    select 1
    from   information_schema.table_constraints tc
    where  tc.table_name       = 'audit_events'
    and    tc.constraint_type  = 'FOREIGN KEY'
    and    tc.constraint_name like '%audit_id%'
  ) then
    alter table public.audit_events
      add constraint audit_events_audit_id_fkey
      foreign key (audit_id)
      references public.audits(audit_id)
      on delete cascade;
  end if;
end
$$;

-- ── Indexes (idempotent) ──────────────────────────────────────────────────────
-- Already created in migration 002, but guarded with IF NOT EXISTS
-- so this file is safe to run independently.
create index if not exists audit_events_audit_id_idx
  on public.audit_events(audit_id);

create index if not exists audit_events_created_at_idx
  on public.audit_events(created_at desc);

-- Composite index for the common query pattern:
-- WHERE audit_id = ? ORDER BY created_at ASC
create index if not exists audit_events_audit_id_created_at_idx
  on public.audit_events(audit_id, created_at asc);
