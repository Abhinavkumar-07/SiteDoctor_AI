// app/report/[auditId]/_components/recommendations-section.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PRIORITY_BG,
  EFFORT_BG,
} from "@/lib/utils/report-utils";
import type { Recommendation, Priority } from "@/lib/types/audit-report";

// ── Single recommendation row ──────────────────────────────────────────────────

interface RecRowProps {
  rec: Recommendation;
  index: number;
}

function RecRow({ rec, index }: RecRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.04 * index }}
      className="rounded-lg border border-border/50 bg-card/60 overflow-hidden"
    >
      {/* Header row — always visible */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-muted/30 transition-colors"
        aria-expanded={expanded}
        aria-controls={`rec-body-${rec.id}`}
      >
        <div className="flex-1 space-y-1.5 min-w-0">
          <p className="text-sm font-medium text-foreground leading-snug">{rec.title}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wide",
                PRIORITY_BG[rec.priority],
              )}
            >
              {rec.priority}
            </span>
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wide",
                EFFORT_BG[rec.effort],
              )}
            >
              {rec.effort} effort
            </span>
          </div>
        </div>
        <div className="shrink-0 mt-0.5 text-muted-foreground">
          {expanded ? (
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          )}
        </div>
      </button>

      {/* Expanded body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id={`rec-body-${rec.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2.5 border-t border-border/40 pt-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {rec.description}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Zap className="h-3 w-3 text-primary shrink-0" aria-hidden="true" />
                <span>
                  <strong className="text-foreground">Impact:</strong> {rec.impact}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Priority group ─────────────────────────────────────────────────────────────

const GROUP_ORDER: Priority[] = ["high", "medium", "low"];
const GROUP_LABEL: Record<Priority, string> = {
  high: "High Priority",
  medium: "Medium Priority",
  low: "Low Priority",
};
const GROUP_ACCENT: Record<Priority, string> = {
  high: "text-red-500",
  medium: "text-yellow-500",
  low: "text-blue-400",
};

interface RecommendationsSectionProps {
  recommendations: Recommendation[];
}

export function RecommendationsSection({
  recommendations,
}: RecommendationsSectionProps) {
  const grouped = GROUP_ORDER.reduce<Record<Priority, Recommendation[]>>(
    (acc, p) => {
      acc[p] = recommendations.filter((r) => r.priority === p);
      return acc;
    },
    { high: [], medium: [], low: [] },
  );

  const hasAny = recommendations.length > 0;

  return (
    <section aria-labelledby="recommendations-heading">
      <h2
        id="recommendations-heading"
        className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4 px-0.5"
      >
        Priority Recommendations
      </h2>

      {!hasAny && (
        <p className="text-sm text-muted-foreground py-6 text-center">
          No recommendations — your site is in great shape!
        </p>
      )}

      <div className="space-y-6">
        {GROUP_ORDER.map((priority) => {
          const items = grouped[priority];
          if (!items.length) return null;
          return (
            <div key={priority} className="space-y-2">
              <h3
                className={cn(
                  "text-xs font-bold tracking-wide uppercase px-0.5",
                  GROUP_ACCENT[priority],
                )}
              >
                {GROUP_LABEL[priority]} ({items.length})
              </h3>
              {items.map((rec, i) => (
                <RecRow key={rec.id} rec={rec} index={i} />
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
