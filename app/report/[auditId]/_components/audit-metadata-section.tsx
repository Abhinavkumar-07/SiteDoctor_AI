// app/report/[auditId]/_components/audit-metadata-section.tsx
"use client";

import { motion } from "framer-motion";
import { Info } from "lucide-react";
import type { AuditReport } from "@/lib/types/audit-report";

interface AuditMetadataSectionProps {
  auditId: string;
  metadata: AuditReport["metadata"];
  createdAt: string;
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs text-foreground text-right break-all font-mono">{value}</span>
    </div>
  );
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function AuditMetadataSection({
  auditId,
  metadata,
  createdAt,
}: AuditMetadataSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      aria-labelledby="metadata-heading"
      className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Info className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <h2
          id="metadata-heading"
          className="text-xs font-semibold tracking-widest uppercase text-muted-foreground"
        >
          Audit Metadata
        </h2>
      </div>

      <MetaRow label="Audit ID" value={auditId} />
      <MetaRow label="Lighthouse" value={metadata.lighthouseVersion} />
      <MetaRow label="Environment" value={metadata.environment} />
      <MetaRow label="Fetch time" value={formatDate(metadata.fetchTime)} />
      <MetaRow label="Completed at" value={formatDate(createdAt)} />
      <MetaRow
        label="User agent"
        value={
          metadata.userAgent.length > 60
            ? metadata.userAgent.slice(0, 60) + "…"
            : metadata.userAgent
        }
      />
    </motion.section>
  );
}
