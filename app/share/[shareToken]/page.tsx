// app/share/[shareToken]/page.tsx
import type { Metadata } from "next";
import { ShareClient } from "./_components/share-client";

interface SharePageProps {
  params: Promise<{ shareToken: string }>;
}

// ── Metadata ──────────────────────────────────────────────────────────────────
// We generate static-safe metadata here.
// When the backend is live, you can fetch the report server-side and populate
// og:title / og:description with real URL + score data.
// For now we use the share token as a stable identifier.

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { shareToken } = await params;

  return {
    title: "Shared Audit Report | SiteDoctor AI",
    description:
      "View a website audit report covering performance, SEO, security, accessibility, UX and conversion — powered by SiteDoctor AI.",
    openGraph: {
      title: "Website Audit Report — SiteDoctor AI",
      description:
        "Performance, SEO, security, accessibility, UX and conversion analysis.",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: "Website Audit Report — SiteDoctor AI",
      description:
        "Performance, SEO, security, accessibility, UX and conversion analysis.",
    },
    // Public share pages are indexable — intentionally no robots noindex
    // so users who share links get SEO benefit for SiteDoctor.
    // You may want to add noindex if reports contain sensitive data.
    robots: {
  index: false,
  follow: false,
},
    alternates: {
      canonical: `/share/${shareToken}`,
    },
  };
}

// ── Page component ────────────────────────────────────────────────────────────
export default async function SharePage({ params }: SharePageProps) {
  const { shareToken } = await params;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <ShareClient shareToken={shareToken} />
      </div>
    </main>
  );
}
