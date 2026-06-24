// app/report/[auditId]/_components/report-error-state.tsx
"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportErrorStateProps {
  auditId: string;
  message?: string;
  onRetry?: () => void;
}

export function ReportErrorState({
  auditId,
  message,
  onRetry,
}: ReportErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
        <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h2 className="text-lg font-semibold text-foreground">Failed to load report</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {message ?? "An unexpected error occurred while loading the audit report."}
        </p>
        <p className="text-xs text-muted-foreground/60 font-mono">ref: {auditId}</p>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} className="gap-2 w-full sm:w-auto">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </Button>
        )}
        <Button asChild variant="outline" className="gap-2 w-full sm:w-auto">
          <Link href="/analyze">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Start a new audit
          </Link>
        </Button>
      </div>
    </div>
  );
}
