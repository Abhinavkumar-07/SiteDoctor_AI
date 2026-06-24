// app/audit/[auditId]/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { AuditProcessingClient } from "./_components/audit-processing-client";

interface AuditPageProps {
  params: Promise<{ auditId: string }>;
}

export async function generateMetadata({
  params,
}: AuditPageProps): Promise<Metadata> {
  const { auditId } = await params;
  return {
    title: `Analysing site — ${auditId} | SiteDoctor`,
    description:
      "Your site audit is running. This usually takes under a minute.",
    robots: { index: false, follow: false },
  };
}

// ── Server component ───────────────────────────────────────────────────────────
export default async function AuditPage({ params }: AuditPageProps) {
  const { auditId } = await params;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
        {/* Page header */}
        <header className="mb-10 text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Analysing your site
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Running Lighthouse, SEO, security and accessibility checks. This
            usually takes under a minute.
          </p>
        </header>

        {/*
         * Suspense boundary ensures that any lazy-loaded chunks inside
         * AuditProcessingClient don't block the server shell from streaming.
         * The client component renders its own skeleton on first load, so
         * the fallback here is intentionally minimal.
         */}
        <Suspense fallback={null}>
          <AuditProcessingClient auditId={auditId} />
        </Suspense>
      </div>
    </main>
  );
}
