// app/dashboard/_components/audit-card.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink, Calendar, Share2, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DashboardAuditRow } from "@/lib/interfaces/i-dashboard-store";

// ── Grade colour helpers ──────────────────────────────────────────────────────

const GRADE_COLOR: Record<string, string> = {
  A: "text-emerald-500",
  B: "text-green-500",
  C: "text-yellow-500",
  D: "text-orange-500",
  F: "text-red-500",
};

const GRADE_BG: Record<string, string> = {
  A: "bg-emerald-500/10 border-emerald-500/20",
  B: "bg-green-500/10 border-green-500/20",
  C: "bg-yellow-500/10 border-yellow-500/20",
  D: "bg-orange-500/10 border-orange-500/20",
  F: "bg-red-500/10 border-red-500/20",
};

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

// ── AuditCard ─────────────────────────────────────────────────────────────────

interface AuditCardProps {
  audit: DashboardAuditRow;
  index: number;
  onDelete: (auditId: string) => void;
}

export function AuditCard({ audit, index, onDelete }: AuditCardProps) {
  let displayHost = audit.url;
  try {
    displayHost = new URL(audit.url).hostname;
  } catch {
    /* keep raw */
  }

  const grade = audit.overallGrade ?? "—";
  const score = audit.overallScore;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <Card className="border-border/60 bg-card/80 backdrop-blur-sm hover:border-border transition-colors group">
        <CardContent className="p-0">
          {/* Screenshot thumbnail */}
          <div className="relative h-28 w-full overflow-hidden rounded-t-xl bg-muted/40">
            {audit.screenshotUrl ? (
              <Image
                src={audit.screenshotUrl}
                alt={`Screenshot of ${displayHost}`}
                fill
                className="object-cover object-top"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-xs text-muted-foreground">No screenshot</span>
              </div>
            )}

            {/* Grade badge overlay */}
            {grade !== "—" && (
              <span
                className={cn(
                  "absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-extrabold",
                  GRADE_BG[grade] ?? "bg-muted/50",
                  GRADE_COLOR[grade] ?? "text-foreground",
                )}
              >
                {grade}
              </span>
            )}
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            {/* URL + external link */}
            <div className="flex items-center gap-1.5 min-w-0">
              <Link
                href={`/report/${audit.auditId}`}
                className="text-sm font-semibold text-foreground truncate hover:underline"
              >
                {displayHost}
              </Link>
              <a
                href={audit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-muted-foreground hover:text-foreground"
                aria-label={`Visit ${audit.url}`}
              >
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            </div>

            {/* Score + date */}
            <div className="flex items-center justify-between gap-2">
              {score !== null ? (
                <span
                  className={cn(
                    "text-lg font-bold tabular-nums",
                    GRADE_COLOR[grade] ?? "text-foreground",
                  )}
                >
                  {score}
                  <span className="text-xs font-normal text-muted-foreground ml-0.5">
                    / 100
                  </span>
                </span>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Pending
                </Badge>
              )}

              <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <Calendar className="h-3 w-3" aria-hidden />
                {formatDate(audit.createdAt)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <Button asChild size="sm" className="flex-1 h-7 text-xs">
                <Link href={`/report/${audit.auditId}`}>View Report</Link>
              </Button>

              <Button
                asChild
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0"
                aria-label="Open share link"
              >
                <Link href={`/share/${audit.shareToken}`}>
                  <Share2 className="h-3 w-3" aria-hidden />
                </Link>
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive"
                aria-label="Delete audit"
                onClick={() => onDelete(audit.auditId)}
              >
                <Trash2 className="h-3 w-3" aria-hidden />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
