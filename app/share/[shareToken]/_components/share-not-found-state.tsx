// app/share/[shareToken]/_components/share-not-found-state.tsx
"use client";

import Link from "next/link";
import { FileX2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareNotFoundStateProps {
  shareToken: string;
}

export function ShareNotFoundState({ shareToken }: ShareNotFoundStateProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted ring-1 ring-border">
        <FileX2 className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h2 className="text-lg font-semibold text-foreground">
          Report not found
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This share link doesn&apos;t exist or may have been removed. Check
          the URL and try again.
        </p>
        <p className="text-xs text-muted-foreground/50 font-mono">
          ref: {shareToken.slice(0, 10)}…
        </p>
      </div>
      <Button asChild className="gap-2">
        <Link href="/analyze">
          <Zap className="h-4 w-4" aria-hidden="true" />
          Audit your own site
        </Link>
      </Button>
    </div>
  );
}
