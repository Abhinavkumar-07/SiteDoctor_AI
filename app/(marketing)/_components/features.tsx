import {
  Gauge,
  Search,
  ShieldCheck,
  Eye,
  LayoutGrid,
  Target,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

/**
 * Destination : app/(marketing)/_components/features.tsx
 * Dependencies: lucide-react (in package.json)
 *               @/components/ui/card (shadcn — npx shadcn@latest add card)
 */

const CATEGORIES = [
  {
    icon: Gauge,
    title: "Performance",
    description: "Core Web Vitals — LCP, CLS, INP, and more.",
  },
  {
    icon: Search,
    title: "SEO",
    description: "Titles, meta tags, headings, sitemap, robots.txt.",
  },
  {
    icon: ShieldCheck,
    title: "Security",
    description: "HTTPS, TLS, security headers, mixed content.",
  },
  {
    icon: Eye,
    title: "Accessibility",
    description: "Labels, contrast, alt text, keyboard navigation.",
  },
  {
    icon: LayoutGrid,
    title: "UX",
    description: "Layout, navigation, visual hierarchy, trust signals.",
  },
  {
    icon: Target,
    title: "Conversion",
    description: "CTA visibility, value proposition, friction points.",
  },
] as const;

export function Features() {
  return (
    <section
      aria-labelledby="features-heading"
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6"
    >
      <h2
        id="features-heading"
        className="text-center font-body text-xs font-medium uppercase tracking-widest text-slate"
      >
        What we check
      </h2>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map(({ icon: Icon, title, description }) => (
          <Card
            key={title}
            className="border-neutral-200 bg-neutral-50 shadow-none"
          >
            <CardHeader className="gap-2 p-4">
              <Icon
                className="h-5 w-5 text-signal-600"
                aria-hidden="true"
              />
              <CardTitle className="font-display text-sm font-semibold text-ink">
                {title}
              </CardTitle>
              <CardDescription className="font-body text-xs text-slate">
                {description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
