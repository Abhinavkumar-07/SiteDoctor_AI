// app/audit/[auditId]/_components/audit-processing-client.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuditStatus } from "@/hooks/use-audit-status";
import { AuditProgressCard } from "./audit-progress-card";
import { AuditStageList } from "./audit-stage-list";
import { AuditErrorState } from "./audit-error-state";
import { Skeleton } from "@/components/ui/skeleton";

interface AuditProcessingClientProps {
  auditId: string;
}

// ── First-load skeleton ────────────────────────────────────────────────────────
function AuditLoadingSkeleton() {
  return (
    <div
      className="space-y-6 animate-pulse"
      aria-busy="true"
      aria-label="Loading audit status"
    >
      {/* Progress card skeleton */}
      <div className="rounded-xl border border-border/60 p-5 space-y-4 bg-card/80">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>

      {/* Stage list skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg px-4 py-3 bg-muted/30"
          >
            <Skeleton className="h-3 w-4 shrink-0" />
            <Skeleton className="h-4 w-4 rounded-full shrink-0" />
            <Skeleton className="h-3 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Redirecting interstitial ───────────────────────────────────────────────────
// Displayed after status === "completed" while the router push is in flight.
// Prevents the brief flash of the progress UI before navigation completes.
function AuditRedirectingState() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-20"
      aria-live="polite"
      aria-label="Redirecting to your report"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">
        Analysis complete — opening your report…
      </p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function AuditProcessingClient({ auditId }: AuditProcessingClientProps) {
  const router = useRouter();
  const { data, isLoading, isPolling, error, retry } = useAuditStatus(auditId);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Trigger redirect when audit completes. Setting `isRedirecting` first
  // swaps in the interstitial view so the progress UI doesn't flash.
  useEffect(() => {
    if (data?.status === "completed" && data.reportSlug) {
      setIsRedirecting(true);
      router.push(`/report/${data.reportSlug}`);
    }
  }, [data?.status, data?.reportSlug, router]);

  // ── Render states (ordered by priority) ──────────────────────────────────────

  if (isLoading) {
    return <AuditLoadingSkeleton />;
  }

  // Must check before the error branch: completed data arrives before redirect fires.
  if (isRedirecting) {
    return <AuditRedirectingState />;
  }

  // Client-side network / parse error with no data yet
  if (error && !data) {
    return (
      <AuditErrorState auditId={auditId} message={error} onRetry={retry} />
    );
  }

  // API-reported terminal failure
  if (data?.status === "failed") {
    return (
      <AuditErrorState
        auditId={auditId}
        message={data.errorMessage}
        onRetry={retry}
      />
    );
  }

  // Defensive guard — shouldn't be reachable post-load, but narrows types below.
  if (!data) {
    return (
      <AuditErrorState
        auditId={auditId}
        message="Could not retrieve audit details."
        onRetry={retry}
      />
    );
  }

  // ── Active state (queued | processing) ────────────────────────────────────────
  return (
    <div className="space-y-6">
      <AuditProgressCard data={data} />

      {data.stages.length > 0 && (
        <section aria-labelledby="stages-heading">
          <h2
            id="stages-heading"
            className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3 px-1"
          >
            Checks
          </h2>
          <AuditStageList stages={data.stages} />
        </section>
      )}

      {/* Polling heartbeat — aria-live so screen readers are notified */}
      {isPolling && (
        <div
          className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2"
          aria-live="polite"
          aria-atomic="true"
        >
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          Updating every 3 seconds
        </div>
      )}
    </div>
  );
}
