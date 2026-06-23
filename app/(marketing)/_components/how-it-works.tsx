/**
 * Destination : app/(marketing)/_components/how-it-works.tsx
 * Dependencies: none — pure server component, no external imports
 */

const STEPS = [
  {
    number: "01",
    title: "Enter your URL",
    description:
      "No signup required — just paste your website address and hit Run.",
  },
  {
    number: "02",
    title: "We analyze your site",
    description:
      "Performance, SEO, security, and accessibility checks, plus AI-powered UX and conversion analysis tailored to your industry.",
  },
  {
    number: "03",
    title: "Get a prioritized report",
    description:
      "A shareable report with the issues that matter most, ranked by priority and effort — not a wall of raw data.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="mx-auto max-w-4xl px-4 py-16 sm:px-6"
    >
      <h2
        id="how-it-works-heading"
        className="text-center font-display text-2xl font-semibold text-ink"
      >
        How it works
      </h2>

      <ol className="mt-10 grid gap-8 sm:grid-cols-3">
        {STEPS.map((step) => (
          <li key={step.number} className="flex flex-col gap-2">
            {/* Step number in data/mono font — matches the diagnostic register */}
            <span
              className="font-data text-sm font-medium text-signal-600"
              aria-hidden="true"
            >
              {step.number}
            </span>
            <h3 className="font-display text-lg font-semibold text-ink">
              {step.title}
            </h3>
            <p className="font-body text-sm leading-relaxed text-slate">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
