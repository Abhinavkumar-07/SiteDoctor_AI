// app/dashboard/_components/dashboard-client.tsx
"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Zap,
  Loader2,
  AlertCircle,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AuditCard } from "./audit-card";
import type { DashboardAuditRow } from "@/lib/interfaces/i-dashboard-store";

interface DashboardResponse {
  audits: DashboardAuditRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Fetcher ───────────────────────────────────────────────────────────────────

async function fetcher(url: string): Promise<DashboardResponse> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<DashboardResponse>;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/60 overflow-hidden">
          <Skeleton className="h-28 w-full rounded-none" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-7 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── DashboardClient ───────────────────────────────────────────────────────────

const PAGE_SIZE = 9;

export function DashboardClient() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [minScore, setMinScore] = useState<number | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  // Build API URL
  const params = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
  });
  if (search) params.set("search", search);
  if (minScore !== undefined) params.set("minScore", String(minScore));

  const { data, error, isLoading, mutate } = useSWR<DashboardResponse>(
    `/api/v1/dashboard?${params.toString()}`,
    fetcher,
    { revalidateOnFocus: false },
  );

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleSearch = useCallback(() => {
    setSearch(searchInput.trim());
    setPage(1);
  }, [searchInput]);

  const handleDelete = useCallback(
    async (auditId: string) => {
      if (!confirm("Delete this audit? This cannot be undone.")) return;
      try {
        await fetch(`/api/v1/dashboard/${auditId}`, { method: "DELETE" });
        mutate();
      } catch {
        alert("Failed to delete audit.");
      }
    },
    [mutate],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch],
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden
            />
            <Input
              placeholder="Search by URL…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9"
              aria-label="Search audits by URL"
            />
          </div>
          <Button onClick={handleSearch} size="default" aria-label="Run search">
            Search
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="default"
            onClick={() => setShowFilters((p) => !p)}
            aria-expanded={showFilters}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            Filters
          </Button>
          <Button asChild size="default">
            <Link href="/analyze" className="gap-2 flex items-center">
              <Zap className="h-4 w-4" aria-hidden />
              New Audit
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-wrap gap-3 p-4 rounded-xl border border-border/60 bg-card/60"
        >
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground whitespace-nowrap" htmlFor="min-score">
              Min score
            </label>
            <Input
              id="min-score"
              type="number"
              min={0}
              max={100}
              placeholder="0"
              className="w-20 h-8 text-xs"
              value={minScore ?? ""}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setMinScore(isNaN(v) ? undefined : v);
                setPage(1);
              }}
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setMinScore(undefined);
              setSearch("");
              setSearchInput("");
              setPage(1);
            }}
          >
            Clear filters
          </Button>
        </motion.div>
      )}

      {/* Stats bar */}
      {data && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {data.total === 0
              ? "No audits found"
              : `${data.total} audit${data.total === 1 ? "" : "s"}`}
            {search ? ` matching "${search}"` : ""}
          </span>
          {data.totalPages > 1 && (
            <span>
              Page {page} of {data.totalPages}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <DashboardSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" aria-hidden />
          <p className="text-sm text-muted-foreground">
            Failed to load audits. Check your Supabase configuration.
          </p>
          <Button onClick={() => mutate()} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      ) : data?.audits.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <LayoutDashboard className="h-10 w-10 text-muted-foreground/40" aria-hidden />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">No audits yet</p>
            <p className="text-xs text-muted-foreground">
              Run your first audit to see it here.
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/analyze">
              <Zap className="h-4 w-4 mr-1.5" aria-hidden />
              Run an audit
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.audits.map((audit, i) => (
            <AuditCard
              key={audit.auditId}
              audit={audit}
              index={i}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </Button>

          <span className="text-xs text-muted-foreground tabular-nums">
            {page} / {data.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      )}
    </div>
  );
}
