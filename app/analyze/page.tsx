import type { Metadata } from "next";
import { UrlSubmissionForm } from "@/components/forms/url-submission-form";

/**
 * Destination : app/analyze/page.tsx
 * Route       : /analyze
 *
 * Server component shell — static hero copy rendered on the server for
 * fast first paint, with a single client island (UrlSubmissionForm) for
 * the interactive form, loading states, and redirect logic.
 *
 * The Footer is NOT rendered here — it lives in app/layout.tsx.
 */

export const metadata: Metadata = {
  title: "Analyze a Website",
  description:
    "Get performance, SEO, security, accessibility, UX, and conversion insights for any public website — powered by AI. Free, no account required.",
};

export default function AnalyzePage() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-2xl flex-col justify-center px-4 py-16 sm:px-6">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Analyze Any Website{" "}
          <span className="text-signal-600">in Seconds</span>
        </h1>
        <p className="mt-4 font-body text-lg text-slate">
          Get performance, SEO, security, accessibility, UX, and conversion
          insights — powered by AI. No account required.
        </p>
      </div>

      {/* ── Submission card ───────────────────────────────────────────────── */}
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
        <UrlSubmissionForm />
      </div>

      {/* ── Trust line ───────────────────────────────────────────────────── */}
      <p className="mt-6 text-center font-body text-xs text-neutral-300">
        Free · No signup required · Results in under two minutes
      </p>
    </div>
  );
}
