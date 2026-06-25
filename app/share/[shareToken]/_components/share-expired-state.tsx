// app/share/[shareToken]/_components/share-expired-state.tsx
"use client";

import Link from "next/link";
import { Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareExpiredStateProps {
  shareToken: string;
}

export function ShareExpiredState({ shareToken }: ShareExpiredStateProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted ring-1 ring-border">
        <Clock className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h2 className="text-lg font-semibold text-foreground">
          This report link has expired
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Shared report links are valid for a limited time. You can run a fresh
          audit to generate a new shareable link.
        </p>
        <p className="text-xs text-muted-foreground/50 font-mono">
          ref: {shareToken.slice(0, 10)}…
        </p>
      </div>
      <Button asChild className="gap-2">
        <Link href="/analyze">
          <Zap className="h-4 w-4" aria-hidden="true" />
          Run a new audit
        </Link>
      </Button>
    </div>
  );
}
