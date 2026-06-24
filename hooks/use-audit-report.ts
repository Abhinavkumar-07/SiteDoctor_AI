// hooks/use-audit-report.ts
"use client";

import useSWR from "swr";
import type { AuditReport } from "@/lib/types/audit-report";

async function fetcher(url: string): Promise<AuditReport> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const err = new Error(`Request failed: ${res.status}`);
    (err as Error & { status: number }).status = res.status;
    throw err;
  }
  return res.json() as Promise<AuditReport>;
}

interface UseAuditReportResult {
  report: AuditReport | undefined;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  mutate: () => void;
}

export function useAuditReport(auditId: string): UseAuditReportResult {
  const { data, error, isLoading, mutate } = useSWR<AuditReport>(
    `/api/v1/audits/${auditId}/report`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  const errorMessage = error
    ? (error as Error).message ?? "Failed to load report."
    : null;

  return {
    report: data,
    isLoading,
    isError: !!error,
    errorMessage,
    mutate,
  };
}
