// app/audit/[auditId]/_components/audit-stage-list.tsx
"use client";

import { CheckCircle2, XCircle, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AuditStage,
  AuditStageId,
  AuditStageStatus,
} from "@/lib/types/audit-status";

// ── Status icon map ────────────────────────────────────────────────────────────
// Defined as a function to ensure a fresh ReactElement per call, avoiding
// potential key reconciliation issues if icons are ever conditionally rendered.
function StatusIcon({ status }: { status: AuditStageStatus }) {
  switch (status) {
    case "pending":
      return (
        <Circle
          className="h-3.5 w-3.5 text-muted-foreground/40"
          aria-hidden="true"
        />
      );
    case "running":
      return (
        <Loader2
          className="h-3.5 w-3.5 text-primary animate-spin"
          aria-hidden="true"
        />
      );
    case "done":
      return (
        <CheckCircle2
          className="h-3.5 w-3.5 text-emerald-500"
          aria-hidden="true"
        />
      );
    case "error":
      return (
        <XCircle
          className="h-3.5 w-3.5 text-destructive"
          aria-hidden="true"
        />
      );
  }
}

const STATUS_ARIA_LABEL: Record<AuditStageStatus, string> = {
  pending: "Pending",
  running: "Running",
  done: "Complete",
  error: "Failed",
};

/** Display index shown to the left of each stage row. */
const STAGE_INDEX: Record<AuditStageId, number> = {
  screenshot: 1,
  lighthouse: 2,
  seo: 3,
  security: 4,
  accessibility: 5,
};

// ── Row ────────────────────────────────────────────────────────────────────────
function StageRow({ stage }: { stage: AuditStage }) {
  const { id, label, status } = stage;

  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-3 transition-colors duration-300",
        {
          "bg-muted/30": status === "pending",
          "bg-primary/5 border border-primary/10": status === "running",
          "bg-emerald-500/5": status === "done",
          "bg-destructive/5": status === "error",
        }
      )}
      aria-label={`${label} — ${STATUS_ARIA_LABEL[status]}`}
    >
      {/* Step number */}
      <span className="w-4 shrink-0 text-right text-xs tabular-nums text-muted-foreground/40 select-none">
        {STAGE_INDEX[id]}
      </span>

      {/* Status icon */}
      <span className="shrink-0">
        <StatusIcon status={status} />
      </span>

      {/* Label */}
      <span
        className={cn("flex-1 text-sm", {
          "text-muted-foreground/60": status === "pending",
          "font-medium text-foreground": status === "running",
          "text-muted-foreground": status === "done",
          "text-destructive": status === "error",
        })}
      >
        {label}
      </span>

      {/* Running badge — visually surfaced so users see activity at a glance */}
      {status === "running" && (
        <span
          className="shrink-0 text-xs text-primary animate-pulse select-none"
          aria-hidden="true" // already captured in the li's aria-label
        >
          Running…
        </span>
      )}
    </li>
  );
}

// ── List ───────────────────────────────────────────────────────────────────────
interface AuditStageListProps {
  stages: AuditStage[];
}

export function AuditStageList({ stages }: AuditStageListProps) {
  return (
    <ul
      className="space-y-2"
      role="list"
      aria-label="Audit checks"
      aria-live="polite"
      aria-relevant="text"
    >
      {stages.map((stage) => (
        <StageRow key={stage.id} stage={stage} />
      ))}
    </ul>
  );
}
