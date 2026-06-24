// app/report/[auditId]/page.tsx
import type { Metadata } from "next";
import { ReportClient } from "./_components/report-client";

interface ReportPageProps {
  params: Promise<{ auditId: string }>;
}

export async function generateMetadata({
  params,
}: ReportPageProps): Promise<Metadata> {
  const { auditId } = await params;
  return {
    title: `Audit Report — ${auditId.slice(0, 8)} | SiteDoctor`,
    description: "Full website audit report covering performance, SEO, security, accessibility, UX and conversion.",
    robots: { index: false, follow: false },
  };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { auditId } = await params;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <ReportClient auditId={auditId} />
      </div>
    </main>
  );
}
