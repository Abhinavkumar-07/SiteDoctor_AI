import type { Metadata } from "next";
import { Hero } from "./_components/hero";
import { Features } from "./_components/features";
import { ExampleAudit } from "./_components/example-audit";
import { HowItWorks } from "./_components/how-it-works";
import { Faq } from "./_components/faq";

/**
 * Destination : app/(marketing)/page.tsx
 *
 * The (marketing) route group has no effect on the URL — this file serves
 * the root route at localhost:3000 / sitedoctor.ai.
 *
 * The Footer is NOT rendered here. It lives in app/layout.tsx and renders
 * automatically on every route. Adding it here would duplicate it.
 *
 * All section components are Server Components (no "use client" directive),
 * with the single exception of Hero which contains the UrlInputForm client
 * island for the URL input and navigation.
 */

export const metadata: Metadata = {
  title: "SiteDoctor AI — Know exactly what's wrong with your website",
  description:
    "AI-powered website audits for performance, SEO, security, accessibility, UX, and conversion. Free, no signup required. Results in under two minutes.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <ExampleAudit />
      <HowItWorks />
      <Faq />
    </>
  );
}
