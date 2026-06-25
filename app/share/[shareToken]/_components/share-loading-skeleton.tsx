// app/share/[shareToken]/_components/share-loading-skeleton.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ShareLoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse" aria-busy="true" aria-label="Loading shared report">
      {/* Branding strip */}
      <Skeleton className="h-3 w-44" />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-16 w-20 rounded-xl shrink-0" />
        </div>
        <Skeleton className="h-px w-full" />
      </div>

      {/* Share toolbar */}
      <Skeleton className="h-16 w-full rounded-xl" />

      {/* Overall score card */}
      <div className="rounded-2xl border border-border/60 p-6 sm:p-8 flex gap-8 items-center">
        <Skeleton className="h-32 w-32 rounded-full shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full max-w-sm" />
          <Skeleton className="h-4 w-3/4 max-w-sm" />
        </div>
      </div>

      {/* Category cards */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-28" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/60 p-5 space-y-4"
            >
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-7 w-7 rounded-md" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-40" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
