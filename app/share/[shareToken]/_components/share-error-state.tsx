// app/share/[shareToken]/_components/share-error-state.tsx
"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareErrorStateProps {
  shareToken: string;
  message?: string;
  onRetry?: () => void;
}

export function ShareErrorState({
  shareToken,
  message,
  onRetry,
}: ShareErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
        <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h2 className="text-lg font-semibold text-foreground">
          Failed to load report
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {message ?? "An unexpected error occurred. Please try again."}
        </p>
        <p className="text-xs text-muted-foreground/50 font-mono">
          ref: {shareToken.slice(0, 10)}…
        </p>
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
            <Zap className="h-4 w-4" aria-hidden="true" />
            Audit your site
          </Link>
        </Button>
      </div>
    </div>
  );
}
