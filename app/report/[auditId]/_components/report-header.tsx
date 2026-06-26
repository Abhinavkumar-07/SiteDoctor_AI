// app/report/[auditId]/_components/report-header.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, ArrowLeft, Clock, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ReportHeaderProps {
  url: string;
  auditId: string;
  completedAt: string;
}

function formatTimestamp(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function ReportHeader({ url, auditId, completedAt }: ReportHeaderProps) {
  let displayUrl = url;
  try {
    displayUrl = new URL(url).hostname;
  } catch {
    // keep original
  }
  
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* Back nav */}
      <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground">
        <Link href="/analyze">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          New audit
        </Link>
      </Button>

      {/* Title block */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground break-all">
            {displayUrl}
          </h1>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${url} in a new tab`}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        {/* Meta pills */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {formatTimestamp(completedAt)}
          </span>
          <Badge variant="outline" className="gap-1 text-[11px] font-mono px-2 py-0">
            <Hash className="h-2.5 w-2.5" aria-hidden="true" />
            {auditId.slice(0, 8)}
          </Badge>
        </div>
      </div>
    </motion.header>
  );
}
