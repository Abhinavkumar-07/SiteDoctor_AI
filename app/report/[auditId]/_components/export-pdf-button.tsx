// app/report/[auditId]/_components/export-pdf-button.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Download, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PdfExportStatus } from "@/lib/pdf/pdf-types";

interface ExportPdfButtonProps {
  status: PdfExportStatus;
  error: string | null;
  onClick: () => void;
  onRetry: () => void;
}

// ── Per-status configuration ──────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  PdfExportStatus,
  {
    label: string;
    icon: React.ElementType;
    spin?: boolean;
    variant: "default" | "outline" | "ghost" | "destructive" | "secondary";
    extraClass?: string;
    ariaLabel: string;
    disabled: boolean;
  }
> = {
  idle: {
    label: "Export PDF",
    icon: Download,
    variant: "outline",
    ariaLabel: "Export report as PDF",
    disabled: false,
  },
  generating: {
    label: "Generating…",
    icon: Loader2,
    spin: true,
    variant: "outline",
    ariaLabel: "Generating PDF, please wait",
    disabled: true,
  },
  completed: {
    label: "Downloaded!",
    icon: CheckCircle2,
    variant: "outline",
    extraClass: "border-emerald-500/50 text-emerald-500 hover:text-emerald-500",
    ariaLabel: "PDF downloaded successfully",
    disabled: false,
  },
  failed: {
    label: "Retry export",
    icon: AlertCircle,
    variant: "outline",
    extraClass: "border-destructive/50 text-destructive hover:text-destructive",
    ariaLabel: "PDF export failed, click to retry",
    disabled: false,
  },
};

export function ExportPdfButton({
  status,
  error,
  onClick,
  onRetry,
}: ExportPdfButtonProps) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  const handleClick = status === "failed" ? onRetry : onClick;

  return (
    <div className="flex flex-col items-start gap-1.5">
      <Button
        variant={cfg.variant}
        size="sm"
        onClick={handleClick}
        disabled={cfg.disabled}
        aria-label={cfg.ariaLabel}
        aria-busy={status === "generating"}
        className={cn("gap-2 min-w-[140px] transition-all duration-200", cfg.extraClass)}
      >
        {/* Icon — animate between states */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={status}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.15 }}
            className="flex items-center"
            aria-hidden="true"
          >
            <Icon
              className={cn("h-3.5 w-3.5", cfg.spin && "animate-spin")}
            />
          </motion.span>
        </AnimatePresence>

        {/* Label — animate between states */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={status}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {cfg.label}
          </motion.span>
        </AnimatePresence>
      </Button>

      {/* Error message — shown below the button */}
      <AnimatePresence>
        {status === "failed" && error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-destructive max-w-[280px] leading-snug"
            role="alert"
            aria-live="polite"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
