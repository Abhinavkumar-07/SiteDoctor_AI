// app/report/[auditId]/_components/report-empty-state.tsx
"use client";

import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportEmptyStateProps {
  auditId: string;
}

export function ReportEmptyState({ auditId }: ReportEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted ring-1 ring-border">
        <FileQuestion className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h2 className="text-lg font-semibold text-foreground">Report not found</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The report for this audit doesn&apos;t exist yet or may have been removed.
        </p>
        <p className="text-xs text-muted-foreground/60 font-mono">ref: {auditId}</p>
      </div>
      <Button asChild variant="outline" className="gap-2">
        <Link href="/analyze">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Start a new audit
        </Link>
      </Button>
    </div>
  );
}
