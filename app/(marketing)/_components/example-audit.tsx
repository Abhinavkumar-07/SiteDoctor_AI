import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Destination : app/(marketing)/_components/example-audit.tsx
 * Dependencies: @/components/ui/badge (shadcn — npx shadcn@latest add badge)
 *               @/components/ui/card  (shadcn — npx shadcn@latest add card)
 *
 * Static illustrative content — not fetched from any real audit.
 * Mobile shows only the first three category scores per UI_Blueprint.md §1.
 */

const SAMPLE_SCORES = [
  { label: "Performance", value: 82 },
  { label: "SEO",         value: 90 },
  { label: "Security",    value: 100 },
  { label: "Accessibility", value: 70 },
  { label: "UX",          value: 76 },
  { label: "Conversion",  value: 75 },
] as const;

const SAMPLE_RECOMMENDATIONS = [
  { priority: "High",   title: "Compress and lazy-load the hero image" },
  { priority: "High",   title: "Add missing alt text on product images" },
  { priority: "Medium", title: "Fix heading hierarchy on the homepage" },
] as const;

function scoreColor(value: number): string {
  if (value >= 90) return "text-vital-good";
  if (value >= 70) return "text-vital-warning";
  return "text-vital-critical";
}

export function ExampleAudit() {
  return (
    <section
      aria-labelledby="example-audit-heading"
      className="mx-auto max-w-4xl px-4 py-16 sm:px-6"
    >
      <h2
        id="example-audit-heading"
        className="text-center font-display text-2xl font-semibold text-ink"
      >
        Here&apos;s what a report looks like
      </h2>
      <p className="mt-2 text-center font-body text-base text-slate">
        A real audit, condensed — every report includes the full breakdown.
      </p>

      <Card className="mt-10 border-neutral-200 shadow-none">
        {/* Score hero */}
        <CardHeader className="flex flex-col items-center gap-1 border-b border-neutral-200 pb-6 text-center">
          <span
            className="font-display text-6xl font-semibold text-vital-good"
            aria-label="Overall score: 78 out of 100"
          >
            78
          </span>
          <p className="font-body text-sm text-slate">
            example-restaurant.com — a few quick wins available
          </p>
        </CardHeader>

        <CardContent className="grid gap-8 pt-6 sm:grid-cols-2">
          {/* Category scores */}
          <div>
            <h3 className="font-body text-xs font-medium uppercase tracking-widest text-slate">
              Category scores
            </h3>
            <dl className="mt-3 space-y-2">
              {SAMPLE_SCORES.map((score, index) => (
                <div
                  key={score.label}
                  className={`flex items-center justify-between ${
                    index >= 3 ? "hidden sm:flex" : ""
                  }`}
                >
                  <dt className="font-body text-sm text-ink">{score.label}</dt>
                  <dd
                    className={`font-data text-sm font-medium tabular-nums ${scoreColor(score.value)}`}
                  >
                    {score.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="font-body text-xs font-medium uppercase tracking-widest text-slate">
              Top recommendations
            </h3>
            <ul className="mt-3 space-y-3">
              {SAMPLE_RECOMMENDATIONS.map((rec) => (
                <li key={rec.title} className="flex items-start gap-2">
                  <Badge
                    variant="outline"
                    className={
                      rec.priority === "High"
                        ? "shrink-0 border-vital-critical/40 text-vital-critical"
                        : "shrink-0 border-vital-warning/40 text-vital-warning"
                    }
                  >
                    {rec.priority}
                  </Badge>
                  <span className="font-body text-sm text-ink">
                    {rec.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
