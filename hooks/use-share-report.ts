// hooks/use-share-report.ts
"use client";

import useSWR from "swr";
import type { ShareReport } from "@/lib/types/share-report";

async function fetcher(url: string): Promise<ShareReport> {
  const res = await fetch(url, { cache: "no-store" });

  if (res.status === 404) {
    const err = new Error("Share link not found or has expired.");
    (err as Error & { status: number }).status = 404;
    throw err;
  }

  if (res.status === 410) {
    const err = new Error("This share link has expired.");
    (err as Error & { status: number }).status = 410;
    throw err;
  }

  if (!res.ok) {
    const err = new Error(`Failed to load shared report (${res.status}).`);
    (err as Error & { status: number }).status = res.status;
    throw err;
  }

  return res.json() as Promise<ShareReport>;
}

interface UseShareReportResult {
  report: ShareReport | undefined;
  isLoading: boolean;
  isError: boolean;
  isExpired: boolean;
  isNotFound: boolean;
  errorMessage: string | null;
  mutate: () => void;
}

export function useShareReport(shareToken: string): UseShareReportResult {
  const { data, error, isLoading, mutate } = useSWR<ShareReport>(
    `/api/v1/share/${shareToken}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  const status = (error as (Error & { status?: number }) | undefined)?.status;
  const isNotFound = status === 404;
  const isExpired = status === 410 || !!data?.isExpired;

  return {
    report: data,
    isLoading,
    isError: !!error,
    isExpired,
    isNotFound,
    errorMessage: error ? (error as Error).message : null,
    mutate,
  };
}
