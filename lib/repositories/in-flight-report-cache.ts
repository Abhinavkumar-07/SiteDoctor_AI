// lib/repositories/in-flight-report-cache.ts
//
// Prevents duplicate Lighthouse executions when two or more concurrent
// requests arrive for the same auditId before any of them has written the
// report to Supabase (OG3).
//
// ── The problem ───────────────────────────────────────────────────────────────
// ReportRepository and ShareRepository both follow this pattern:
//
//   1. findByAuditId()      → null  (DB has no row yet)
//   2. buildReport()        → runs Lighthouse for ~15-30s
//   3. reportStore.save()   → writes the row
//   4. return report
//
// If two requests for the same auditId arrive simultaneously, both pass
// step 1 before either completes step 3. Both then invoke buildReport() —
// two full Playwright + Lighthouse runs competing for CPU and RAM.
//
// The await fix on save() (Step 8.7) closed the *sequential* retry race
// (request B arrives after request A's response is sent, within the DB
// write window). But it cannot close the *concurrent* race where both
// requests arrive before either has started writing.
//
// ── The fix ───────────────────────────────────────────────────────────────────
// An in-process Map<auditId, Promise<AuditReportResponse>> acts as a
// "coalescing barrier":
//
//   - First caller: no entry → creates the Promise, stores it, awaits it.
//   - Concurrent callers: entry exists → await the SAME Promise.
//   - All callers receive the same resolved value from one Lighthouse run.
//   - On resolution (or rejection): entry is deleted so future cold callers
//     go back to the normal Supabase-first path.
//
// This works because Node.js is single-threaded: the Map.has() check, the
// Promise construction, and the Map.set() all run synchronously before any
// async suspension point. There is no race on the Map itself.
//
// ── Scope ─────────────────────────────────────────────────────────────────────
// This module is intentionally repository-scoped, not app-wide.
// It deduplicates within a single Node.js process / Next.js server instance.
// Under horizontal scaling (multiple pods), each pod has its own Map — the
// deduplication guarantee holds within a pod; cross-pod deduplication
// requires a distributed lock (Redis, Supabase advisory lock) which is
// out of scope for Step 8.8.
//
// ── Lifetime ──────────────────────────────────────────────────────────────────
// Entries exist only for the duration of the buildReport() call (~15-30s).
// They are removed in the finally block regardless of success or failure.
// A rejected buildReport() removes its entry so the next request retries
// from scratch rather than being handed a rejected Promise.

import type { AuditReportResponse } from "@/lib/types/audit-api";

// ── Module-scoped singleton Map ───────────────────────────────────────────────
// Plain module scope (not globalThis) is intentional: Next.js hot-reload
// re-evaluates modules, which clears any in-flight promises from the
// previous module instance. This is safe — any request that was awaiting
// a cleared promise will simply fall through to a fresh findByAuditId()
// call on the next attempt. Using globalThis here would prevent that
// clean reset.

const inFlightMap = new Map<string, Promise<AuditReportResponse>>();

// ── Public API ────────────────────────────────────────────────────────────────

export type ReportBuilder = () => Promise<AuditReportResponse>;

/**
 * Ensures `builder` is called at most once for a given `auditId` at any
 * point in time.
 *
 * If a call for `auditId` is already in progress, returns the existing
 * Promise so all concurrent callers share one Lighthouse run.
 *
 * If no call is in progress, invokes `builder`, registers the Promise,
 * and removes it from the map when it settles.
 *
 * @param auditId  The audit being built — used as the deduplication key.
 * @param builder  A zero-argument async factory that runs Lighthouse.
 *                 Called at most once per concurrent group.
 */
export function getOrBuildReport(
  auditId: string,
  builder: ReportBuilder,
): Promise<AuditReportResponse> {
  // Fast path: return the existing in-flight Promise.
  const existing = inFlightMap.get(auditId);
  if (existing) {
    return existing;
  }

  // Slow path: create, register, and track the new Promise.
  // The Promise is constructed synchronously and stored before the first
  // await suspension point — no concurrent caller can slip in between.
  const promise = builder().finally(() => {
    // Clean up regardless of success or failure.
    // On failure: removing the entry lets the next caller retry from scratch.
    // On success: Supabase now has the row, so the next caller will hit the
    //             DB cache and never reach this code path again.
    inFlightMap.delete(auditId);
  });

  inFlightMap.set(auditId, promise);
  return promise;
}

/**
 * Returns the number of in-flight builds currently registered.
 * Intended for use in tests and health checks only.
 */
export function inFlightCount(): number {
  return inFlightMap.size;
}

/**
 * Forcibly clears all in-flight entries.
 * Use only in test teardown — never call in production code.
 */
export function clearInFlightCache(): void {
  inFlightMap.clear();
}
