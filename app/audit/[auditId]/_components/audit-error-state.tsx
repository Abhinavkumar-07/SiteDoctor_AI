// app/audit/[auditId]/_components/audit-error-state.tsx
"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Keep route constants in one place so a path rename is a one-line change.
const ANALYZE_HREF = "/analyze";

const DEFAULT_MESSAGE =
  "Something went wrong while analysing this site. This is usually temporary — please retry or try a different URL.";

interface AuditErrorStateProps {
  /** Human-readable message from the API or a client-side error string. */
  message?: string;
  /** Retry handler — omit to hide the Retry button. */
  onRetry?: () => void;
  /** Shown as a monospace reference code beneath the message. */
  auditId: string;
}

export function AuditErrorState({
  message,
  onRetry,
  auditId,
}: AuditErrorStateProps) {
  const displayMessage = message ?? DEFAULT_MESSAGE;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex flex-col items-center gap-6 py-10 text-center"
    >
      {/* Icon */}
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20"
        aria-hidden="true"
      >
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>

      {/* Copy */}
      <div className="space-y-2 max-w-sm">
        <h2 className="text-lg font-semibold text-foreground">Audit failed</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {displayMessage}
        </p>
        <p className="text-xs text-muted-foreground/60 font-mono">
          ref: {auditId}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        {onRetry && (
          <Button
            onClick={onRetry}
            className="w-full sm:w-auto gap-2"
            aria-label="Retry this audit"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </Button>
        )}

        <Button
          asChild
          variant="outline"
          className="w-full sm:w-auto gap-2"
        >
          <Link href={ANALYZE_HREF}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Try a different URL
          </Link>
        </Button>
      </div>
    </div>
  );
}
