// app/report/[auditId]/_components/screenshot-section.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Monitor, Smartphone, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Screenshots } from "@/lib/types/audit-report";

type ViewMode = "desktop" | "mobile";

interface ScreenshotSectionProps {
  screenshots: Screenshots;
}

export function ScreenshotSection({ screenshots }: ScreenshotSectionProps) {
  const [view, setView] = useState<ViewMode>("desktop");

  const hasDesktop = !!screenshots.desktopUrl;
  const hasMobile = !!screenshots.mobileUrl;
  const hasAny = hasDesktop || hasMobile;

  // Keep the tab choice valid when only one exists
  const activeUrl =
    view === "desktop"
      ? screenshots.desktopUrl
      : screenshots.mobileUrl;

  return (
    <section aria-labelledby="screenshots-heading">
      <h2
        id="screenshots-heading"
        className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4 px-0.5"
      >
        Screenshots
      </h2>

      {!hasAny ? (
        <div className="flex flex-col items-center gap-3 py-12 rounded-xl border border-dashed border-border/50 text-muted-foreground">
          <ImageOff className="h-8 w-8" aria-hidden="true" />
          <p className="text-sm">Screenshots not available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Tab row */}
          <div
            role="tablist"
            aria-label="Screenshot view"
            className="inline-flex items-center gap-1 rounded-lg bg-muted/50 p-1"
          >
            {(["desktop", "mobile"] as ViewMode[]).map((mode) => {
              const available = mode === "desktop" ? hasDesktop : hasMobile;
              const Icon = mode === "desktop" ? Monitor : Smartphone;
              return (
                <button
                  key={mode}
                  role="tab"
                  aria-selected={view === mode}
                  aria-controls="screenshot-panel"
                  disabled={!available}
                  onClick={() => setView(mode)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    view === mode
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                    !available && "opacity-40 cursor-not-allowed",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {mode === "desktop" ? "Desktop" : "Mobile"}
                </button>
              );
            })}
          </div>

          {/* Image panel */}
          <div
            id="screenshot-panel"
            role="tabpanel"
            className="relative overflow-hidden rounded-xl border border-border/60 bg-muted/20"
          >
            <AnimatePresence mode="wait">
              {activeUrl ? (
                <motion.div
                  key={view}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image
                    src={activeUrl}
                    alt={`${view} screenshot of the audited website`}
                    width={view === "desktop" ? 1280 : 390}
                    height={view === "desktop" ? 800 : 844}
                    className="w-full h-auto object-cover object-top"
                    priority={false}
                    unoptimized // GCS URLs; use next/image optimization once CDN is configured
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-3 py-16 text-muted-foreground"
                >
                  <ImageOff className="h-6 w-6" aria-hidden="true" />
                  <p className="text-sm">No {view} screenshot captured</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </section>
  );
}
