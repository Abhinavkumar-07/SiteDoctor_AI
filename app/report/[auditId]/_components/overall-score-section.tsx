// app/report/[auditId]/_components/overall-score-section.tsx
"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { GRADE_COLOR, GRADE_BG } from "@/lib/utils/report-utils";
import type { Grade } from "@/lib/types/audit-report";

interface OverallScoreSectionProps {
  score: number;
  grade: Grade;
  summary: string;
}

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function OverallScoreSection({
  score,
  grade,
  summary,
}: OverallScoreSectionProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const dashOffset = useTransform(
    count,
    [0, 100],
    [CIRCUMFERENCE, CIRCUMFERENCE - (CIRCUMFERENCE * score) / 100],
  );

  useEffect(() => {
    const controls = animate(count, score, {
      duration: 1.4,
      ease: "easeOut",
    });
    return controls.stop;
  }, [count, score]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      aria-labelledby="overall-score-heading"
      className="flex flex-col sm:flex-row items-center gap-8 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-6 sm:p-8"
    >
      {/* SVG ring */}
      <div className="relative shrink-0" aria-hidden="true">
        <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
          {/* Track */}
          <circle
            cx="64"
            cy="64"
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-muted/40"
          />
          {/* Progress */}
          <motion.circle
            cx="64"
            cy="64"
            r={RADIUS}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            style={{ strokeDashoffset: dashOffset }}
            className={cn(
              "transition-colors",
              grade === "A" && "stroke-emerald-500",
              grade === "B" && "stroke-green-500",
              grade === "C" && "stroke-yellow-500",
              grade === "D" && "stroke-orange-500",
              grade === "F" && "stroke-red-500",
            )}
          />
        </svg>

        {/* Score number overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <motion.span
            className={cn("text-3xl font-extrabold tabular-nums leading-none", GRADE_COLOR[grade])}
          >
            {rounded}
          </motion.span>
          <span className="text-[11px] text-muted-foreground font-medium mt-0.5">/ 100</span>
        </div>
      </div>

      {/* Text block */}
      <div className="flex-1 text-center sm:text-left space-y-3">
        <div className="flex items-center justify-center sm:justify-start gap-3">
          <h2 id="overall-score-heading" className="text-xl font-bold text-foreground">
            Overall Score
          </h2>
          <span
            className={cn(
              "inline-flex items-center justify-center h-8 w-8 rounded-lg border text-sm font-extrabold",
              GRADE_BG[grade],
              GRADE_COLOR[grade],
            )}
            aria-label={`Grade ${grade}`}
          >
            {grade}
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-prose">
          {summary}
        </p>
      </div>
    </motion.section>
  );
}
