// app/share/[shareToken]/_components/share-toolbar.tsx
"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Copy, Check, Share2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareToolbarProps {
  shareToken: string;
  /** The URL of the audited site, used in the native share dialog. */
  auditedUrl: string;
}

export function ShareToolbar({ shareToken, auditedUrl }: ShareToolbarProps) {
  const [copied, setCopied] = useState(false);

  // Build the canonical share URL on the client (window.location.origin)
  const getShareUrl = useCallback((): string => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/share/${shareToken}`;
  }, [shareToken]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text in a temporary input
      const input = document.createElement("input");
      input.value = getShareUrl();
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [getShareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: "SiteDoctor AI — Website Audit Report",
        text: `Check out the audit report for ${auditedUrl}`,
        url: getShareUrl(),
      });
    } catch {
      // User cancelled or share failed — silent
    }
  }, [auditedUrl, getShareUrl]);

  const supportsNativeShare =
    typeof window !== "undefined" && !!navigator.share;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className={cn(
        "flex flex-col sm:flex-row items-stretch sm:items-center gap-2",
        "rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-4",
      )}
      role="toolbar"
      aria-label="Share this report"
    >
      {/* Left label */}
      <div className="flex items-center gap-2 mr-auto">
        <Share2 className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
        <span className="text-xs font-medium text-muted-foreground">
          Share this report
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Copy link */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className={cn(
            "gap-2 min-w-[130px] transition-all",
            copied && "border-emerald-500/50 text-emerald-500",
          )}
          aria-label={copied ? "Link copied!" : "Copy share link"}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              Copy link
            </>
          )}
        </Button>

        {/* Native share — only shown when Web Share API is available */}
        {supportsNativeShare && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleNativeShare}
            className="gap-2"
            aria-label="Share via system share dialog"
          >
            <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
            Share
          </Button>
        )}

        {/* CTA */}
        <Button asChild size="sm" className="gap-2">
          <Link href="/analyze">
            <Zap className="h-3.5 w-3.5" aria-hidden="true" />
            Audit your site
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
