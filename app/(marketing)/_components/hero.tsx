import { UrlInputForm } from "@/components/forms/url-input-form";
import { PulseLine } from "@/components/layout/pulse-line";

/**
 * Destination : app/(marketing)/_components/hero.tsx
 * Dependencies: @/components/forms/url-input-form
 *               @/components/layout/pulse-line
 */
export function Hero() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Know exactly what&apos;s wrong{" "}
        <br className="hidden sm:block" />
        with your website.
      </h1>

      <p className="mt-4 max-w-xl font-body text-lg text-slate">
        Enter a URL. Get a full diagnosis of performance, SEO, security,
        accessibility, UX, and conversion — in under a minute.
      </p>

      <div className="mt-8 w-full">
        <UrlInputForm size="lg" />
      </div>

      {/* Signature Pulse Line motif — decorative, aria-hidden inside component */}
      <PulseLine className="mt-16 text-signal-600/40" />
    </section>
  );
}
