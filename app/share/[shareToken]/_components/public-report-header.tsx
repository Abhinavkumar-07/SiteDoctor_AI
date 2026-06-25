// app/share/[shareToken]/_components/public-report-header.tsx
"use client";

import { motion } from "framer-motion";
import { ExternalLink, Calendar, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GRADE_COLOR, GRADE_BG } from "@/lib/utils/report-utils";
import type { Grade } from "@/lib/types/audit-report";

interface PublicReportHeaderProps {
  url: string;
  shareToken: string;
  sharedAt: string;
  overallScore: number;
  overallGrade: Grade;
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function PublicReportHeader({
  url,
  shareToken,
  sharedAt,
  overallScore,
  overallGrade,
}: PublicReportHeaderProps) {
  let displayHost = url;
  try {
    displayHost = new URL(url).hostname;
  } catch {
    // keep raw url
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="space-y-5"
    >
      {/* SiteDoctor branding strip */}
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
        <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          SiteDoctor AI — Public Report
        </span>
      </div>

      {/* Main title row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left: URL + meta */}
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground break-all"
            >
              {displayHost}
            </h1>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${url}`}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          {/* Sub-row: date + token */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              Generated {formatDate(sharedAt)}
            </span>
            <Badge
              variant="outline"
              className="gap-1 text-[11px] font-mono px-2 py-0 shrink-0"
            >
              {shareToken.slice(0, 10)}…
            </Badge>
          </div>
        </div>

        {/* Right: big score pill */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
          className={cn(
            "flex items-center gap-2.5 self-start shrink-0 rounded-xl border px-4 py-3",
            GRADE_BG[overallGrade],
          )}
          aria-label={`Overall score: ${overallScore} out of 100, grade ${overallGrade}`}
        >
          <span
            className={cn("text-3xl font-extrabold tabular-nums leading-none", GRADE_COLOR[overallGrade])}
          >
            {overallScore}
          </span>
          <div className="flex flex-col">
            <span className={cn("text-xl font-extrabold leading-none", GRADE_COLOR[overallGrade])}>
              {overallGrade}
            </span>
            <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
              / 100
            </span>
          </div>
        </motion.div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-border/60" />
    </motion.header>
  );
}
