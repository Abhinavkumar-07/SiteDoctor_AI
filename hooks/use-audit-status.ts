// hooks/use-audit-status.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  isAuditStatusResponse,
  type AuditStatusResponse,
} from "@/lib/types/audit-status";

// ── Config ─────────────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 3_000;
const REQUEST_TIMEOUT_MS = 10_000;
/** Hard cap: ~5 min at 3-second intervals before giving up. */
const MAX_POLL_ATTEMPTS = 100;
/** Consecutive network errors tolerated before surfacing the error to the UI. */
const MAX_CONSECUTIVE_ERRORS = 3;

// ── Public interface ───────────────────────────────────────────────────────────
export interface UseAuditStatusResult {
  data: AuditStatusResponse | null;
  isLoading: boolean;
  isPolling: boolean;
  error: string | null;
  retry: () => void;
}

// ── Hook ───────────────────────────────────────────────────────────────────────
/**
 * Polls `/api/v1/audits/[auditId]/status` on a fixed interval until the audit
 * reaches a terminal state (completed | failed) or a hard cap is hit.
 *
 * Guarantees:
 * - Each pending fetch is cancelled (via AbortController) on unmount or retry.
 * - Stale async callbacks from superseded polling cycles are discarded via an
 *   incrementing `epoch` ref — no setState-after-unmount warnings.
 * - Transient network errors are retried up to MAX_CONSECUTIVE_ERRORS times
 *   with exponential back-off (1 s → 2 s → 4 s, capped at 8 s) before the
 *   error is surfaced to the UI.
 * - Every request carries a hard timeout; a hung server won't stall the cycle.
 */
export function useAuditStatus(auditId: string): UseAuditStatusResult {
  const [data, setData] = useState<AuditStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mutable refs — mutations don't need to trigger re-renders.
  const epochRef = useRef(0);        // bumped each time a new cycle starts
  const pollCountRef = useRef(0);    // total successful polls in this cycle
  const errorCountRef = useRef(0);   // consecutive errors in this cycle
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const abortCurrent = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  // ── Core poll ─────────────────────────────────────────────────────────────────
  const poll = useCallback(
    (epoch: number): void => {
      // Async IIFE so we can await without making the outer function async
      // (which would make it harder to fire-and-forget from setTimeout).
      void (async () => {
        // Guard: if a newer cycle has started, this invocation is stale.
        if (epochRef.current !== epoch) return;

        // Fresh controller per request; attach a hard timeout.
        const ac = new AbortController();
        abortRef.current = ac;
        const timeoutId = setTimeout(
          () =>
            ac.abort(
              new DOMException("Request timed out after 10 s", "TimeoutError")
            ),
          REQUEST_TIMEOUT_MS
        );

        try {
          const res = await fetch(`/api/v1/audits/${auditId}/status`, {
            cache: "no-store",
            signal: ac.signal,
          });
          clearTimeout(timeoutId);

          if (epochRef.current !== epoch) return; // stale — discard

          if (!res.ok) {
            // HTTP 4xx / 5xx — treat as transient; the server may recover.
            throw new Error(
              `HTTP ${res.status}: ${res.statusText || "Server error"}`
            );
          }

          const raw: unknown = await res.json();

          if (epochRef.current !== epoch) return;

          // Runtime validation — reject malformed payloads before touching state.
          if (!isAuditStatusResponse(raw)) {
            throw new Error("Unexpected response shape from audit API");
          }

          setData(raw);
          setError(null);
          errorCountRef.current = 0; // successful response resets error streak

          // ── Terminal states ────────────────────────────────────────────────────
          if (raw.status === "completed" || raw.status === "failed") {
            setIsLoading(false);
            setIsPolling(false);
            clearTimer();
            return;
          }

          // ── Hard attempt cap ───────────────────────────────────────────────────
          pollCountRef.current += 1;
          if (pollCountRef.current >= MAX_POLL_ATTEMPTS) {
            setIsLoading(false);
            setIsPolling(false);
            setError(
              "Audit is taking longer than expected. Please check back later."
            );
            clearTimer();
            return;
          }

          // ── Schedule next poll ─────────────────────────────────────────────────
          setIsLoading(false);
          setIsPolling(true);
          timerRef.current = setTimeout(() => poll(epoch), POLL_INTERVAL_MS);
        } catch (err) {
          clearTimeout(timeoutId);

          if (epochRef.current !== epoch) return;

          // Silently ignore aborts triggered by our own cleanup or timeout guard.
          if (err instanceof DOMException && err.name === "AbortError") return;

          errorCountRef.current += 1;

          if (errorCountRef.current >= MAX_CONSECUTIVE_ERRORS) {
            const message =
              err instanceof Error
                ? err.message
                : "Failed to fetch audit status.";
            setError(message);
            setIsLoading(false);
            setIsPolling(false);
            return;
          }

          // Exponential back-off: 1 s → 2 s → 4 s, capped at 8 s.
          const backoffMs = Math.min(
            1_000 * 2 ** (errorCountRef.current - 1),
            8_000
          );
          setIsLoading(false);
          setIsPolling(true); // keep indicator visible during back-off
          timerRef.current = setTimeout(() => poll(epoch), backoffMs);
        }
      })();
    },
    [auditId, clearTimer]
  );

  // ── Start / restart a polling cycle ───────────────────────────────────────────
  const start = useCallback(() => {
    clearTimer();
    abortCurrent();

    const epoch = ++epochRef.current;
    pollCountRef.current = 0;
    errorCountRef.current = 0;

    setIsLoading(true);
    setIsPolling(false);
    setError(null);
    setData(null);

    poll(epoch);
  }, [poll, clearTimer, abortCurrent]);

  // ── Lifecycle ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    start();

    return () => {
      // Invalidate any in-flight async work for this cycle.
      ++epochRef.current;
      clearTimer();
      abortCurrent();
    };
  }, [start, clearTimer, abortCurrent]);

  // Public retry: simply restarts the full cycle.
  const retry = useCallback(() => start(), [start]);

  return { data, isLoading, isPolling, error, retry };
}
