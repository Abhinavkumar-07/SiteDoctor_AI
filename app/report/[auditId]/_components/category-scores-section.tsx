// app/report/[auditId]/_components/category-scores-section.tsx
"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Search,
  Shield,
  Accessibility,
  MousePointerClick,
  TrendingUp,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GRADE_COLOR,
  GRADE_BG,
  GRADE_PROGRESS,
} from "@/lib/utils/report-utils";
import type { CategoryScore } from "@/lib/types/audit-report";

const ICONS: Record<string, LucideIcon> = {
  performance: Zap,
  seo: Search,
  security: Shield,
  accessibility: Accessibility,
  ux: MousePointerClick,
  conversion: TrendingUp,
};

interface CategoryCardProps {
  category: CategoryScore;
  index: number;
}

function CategoryCard({ category, index }: CategoryCardProps) {
  const Icon = ICONS[category.id] ?? Zap;
  const pct = Math.min(100, Math.max(0, category.score));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 * index, ease: "easeOut" }}
      className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 space-y-4 hover:border-border transition-colors"
    >
      {/* Top row: icon + label + grade badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60">
            <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <span className="text-sm font-semibold text-foreground">{category.label}</span>
        </div>
        <span
          className={cn(
            "inline-flex items-center justify-center h-7 w-7 rounded-md border text-xs font-extrabold shrink-0",
            GRADE_BG[category.grade],
            GRADE_COLOR[category.grade],
          )}
          aria-label={`Grade ${category.grade}`}
        >
          {category.grade}
        </span>
      </div>

      {/* Score + progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Score</span>
          <span
            className={cn("text-sm font-bold tabular-nums", GRADE_COLOR[category.grade])}
          >
            {pct}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${category.label} score: ${pct} out of 100`}
          className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, delay: 0.1 * index, ease: "easeOut" }}
            className={cn("h-full rounded-full", GRADE_PROGRESS[category.grade])}
          />
        </div>
      </div>

      {/* Summary */}
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {category.summary}
      </p>
    </motion.div>
  );
}

interface CategoryScoresSectionProps {
  categories: CategoryScore[];
}

export function CategoryScoresSection({ categories }: CategoryScoresSectionProps) {
  return (
    <section aria-labelledby="category-scores-heading">
      <h2
        id="category-scores-heading"
        className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4 px-0.5"
      >
        Category Scores
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, i) => (
          <CategoryCard key={cat.id} category={cat} index={i} />
        ))}
      </div>
    </section>
  );
}
