// app/audit/[auditId]/_components/audit-progress-card.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AuditStatusResponse } from "@/lib/types/audit-status";

interface AuditProgressCardProps {
  data: AuditStatusResponse;
}

const STATUS_LABEL: Record<AuditStatusResponse["status"], string> = {
  queued: "Queued — waiting to start",
  processing: "Analysing your site…",
  completed: "Analysis complete",
  failed: "Analysis failed",
};

export function AuditProgressCard({ data }: AuditProgressCardProps) {
  const { url, status, progress } = data;

  // Clamp progress to [0, 100] regardless of what the API sends.
  const pct = Math.min(100, Math.max(0, Math.round(progress)));

  const isActive = status === "queued" || status === "processing";
  const isComplete = status === "completed";
  const isFailed = status === "failed";

  return (
    <Card className="w-full border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-3 pt-5 px-5">
        {/* URL chip */}
        <div className="flex items-center gap-2 mb-1">
          <span
            className="inline-flex h-1.5 w-1.5 rounded-full bg-primary shrink-0"
            aria-hidden="true"
          />
          <p
            className="text-xs text-muted-foreground truncate max-w-xs sm:max-w-sm md:max-w-md"
            title={url}
          >
            {url}
          </p>
        </div>

        {/* Status line */}
        <p
          className={cn(
            "text-sm font-medium",
            isFailed ? "text-destructive" : "text-foreground"
          )}
          aria-live="polite"
        >
          {STATUS_LABEL[status]}
        </p>
      </CardHeader>

      <CardContent className="px-5 pb-5 space-y-2">
        {/* Progress bar track */}
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Audit progress: ${pct}%`}
          className="relative h-2 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              isFailed
                ? "bg-destructive"
                : isComplete
                  ? "bg-emerald-500"
                  : "bg-primary"
            )}
            style={{ width: `${pct}%` }}
          />

          {/* Shimmer — only rendered during active states to reduce paint cost */}
          {isActive && (
            <div
              className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Percentage label row */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {isActive
              ? "Running checks…"
              : isComplete
                ? "All checks passed"
                : "Stopped"}
          </span>
          <span
            className={cn(
              "text-xs font-semibold tabular-nums",
              isFailed
                ? "text-destructive"
                : isComplete
                  ? "text-emerald-500"
                  : "text-primary"
            )}
          >
            {pct}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
