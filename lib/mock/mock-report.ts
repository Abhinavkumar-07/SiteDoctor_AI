// lib/mock/mock-report.ts
//
// Builds a complete, realistic AuditReportResponse.
// Scores are seeded from the audited URL so the same URL always returns the
// same scores — useful for demos and deterministic testing.
//
// No randomness — fully deterministic.

import type {
  AuditReportResponse,
  CategoryScore,
  Recommendation,
  CategoryId,
  Grade,
} from "@/lib/types/audit-api";
import { recId } from "@/lib/utils/id";

// ── Deterministic score seeding ───────────────────────────────────────────────

/** Simple djb2-style hash of a string → number 0-99 */
function hashScore(seed: string, salt: string): number {
  const str = seed + salt;
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  // Map to 40–98 range (realistic audit scores — never 100, never catastrophic)
  return 40 + (Math.abs(hash) % 59);
}

function scoreToGrade(score: number): Grade {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  return "F";
}

// ── Category metadata ─────────────────────────────────────────────────────────

const CATEGORY_META: Record<
  CategoryId,
  { label: string; summaryTemplate: (score: number) => string }
> = {
  performance: {
    label: "Performance",
    summaryTemplate: (s) =>
      s >= 75
        ? "Page loads quickly with good Core Web Vitals. LCP and CLS are within acceptable ranges."
        : "Page load times are above average. LCP exceeds 2.5 s on mobile. Consider deferring non-critical JavaScript.",
  },
  seo: {
    label: "SEO",
    summaryTemplate: (s) =>
      s >= 75
        ? "Strong meta tags, structured data and crawlability. Title and description are well-optimised."
        : "Missing meta description on several pages. Heading hierarchy has gaps and image alt text is incomplete.",
  },
  security: {
    label: "Security",
    summaryTemplate: (s) =>
      s >= 75
        ? "HTTPS enforced, strong CSP headers present, no mixed-content issues detected."
        : "Content-Security-Policy header is missing. Several third-party scripts load over HTTP.",
  },
  accessibility: {
    label: "Accessibility",
    summaryTemplate: (s) =>
      s >= 75
        ? "WCAG 2.1 AA largely met. Keyboard navigation and ARIA labels are well implemented."
        : "Multiple interactive elements lack accessible labels. Colour contrast ratio fails WCAG AA on key CTAs.",
  },
  ux: {
    label: "UX",
    summaryTemplate: (s) =>
      s >= 75
        ? "Clear visual hierarchy, readable typography, and consistent interactive patterns across the site."
        : "Mobile tap targets are too small in the navigation. Font sizes drop below 14 px on product cards.",
  },
  conversion: {
    label: "Conversion",
    summaryTemplate: (s) =>
      s >= 75
        ? "Clear CTAs above the fold, trust signals present, and checkout flow is streamlined."
        : "Primary CTA is below the fold on mobile. Social proof elements are absent from the landing page.",
  },
};

// ── Recommendation bank ───────────────────────────────────────────────────────

const REC_BANK: Omit<Recommendation, "id">[] = [
  {
    category: "performance",
    title: "Eliminate render-blocking resources",
    description:
      "Three third-party scripts are loaded synchronously in <head>, blocking first paint by an estimated 640 ms. Move them to async/defer or load them after the main bundle.",
    priority: "high",
    effort: "medium",
    impact: "Reduce FCP by ~640 ms",
  },
  {
    category: "performance",
    title: "Serve images in modern formats",
    description:
      "14 images are served as PNG or JPEG. Converting to WebP or AVIF would reduce image payload by approximately 42%, improving LCP on image-heavy pages.",
    priority: "high",
    effort: "low",
    impact: "Reduce image payload by ~42%",
  },
  {
    category: "performance",
    title: "Enable text compression",
    description:
      "The server does not apply Brotli or Gzip compression to HTML, CSS, or JS responses. Enabling compression could reduce transfer size by up to 70%.",
    priority: "medium",
    effort: "low",
    impact: "Reduce transfer size by ~70%",
  },
  {
    category: "seo",
    title: "Add meta descriptions to all pages",
    description:
      "7 pages are missing the <meta name='description'> tag. Search engines fall back to body copy, which often produces poor snippets and reduces click-through rates.",
    priority: "high",
    effort: "low",
    impact: "Improve CTR from search results",
  },
  {
    category: "seo",
    title: "Fix broken internal links",
    description:
      "4 internal links return HTTP 404. Broken links dilute link equity and create poor user experiences. Update or remove these links.",
    priority: "medium",
    effort: "low",
    impact: "Preserve link equity, reduce bounce rate",
  },
  {
    category: "seo",
    title: "Add structured data markup",
    description:
      "No JSON-LD structured data is present. Adding Organisation, BreadcrumbList, and Product schema improves rich-snippet eligibility in search results.",
    priority: "low",
    effort: "medium",
    impact: "Enable rich search snippets",
  },
  {
    category: "security",
    title: "Implement Content-Security-Policy header",
    description:
      "No CSP header is present. A strict CSP prevents XSS attacks by whitelisting trusted script sources. Start with a report-only policy and harden iteratively.",
    priority: "high",
    effort: "high",
    impact: "Eliminate XSS attack surface",
  },
  {
    category: "security",
    title: "Add missing security headers",
    description:
      "X-Frame-Options, X-Content-Type-Options, and Referrer-Policy headers are absent. These are low-effort, high-impact hardening measures.",
    priority: "medium",
    effort: "low",
    impact: "Reduce clickjacking and MIME-sniffing risk",
  },
  {
    category: "accessibility",
    title: "Fix colour contrast failures",
    description:
      "6 text elements have a contrast ratio below 4.5:1, failing WCAG AA. The primary CTA button (#6366f1 on white) has a ratio of 3.2:1. Darken the foreground or lighten the background.",
    priority: "high",
    effort: "low",
    impact: "Pass WCAG 2.1 AA colour contrast",
  },
  {
    category: "accessibility",
    title: "Add labels to all form inputs",
    description:
      "The newsletter signup form has 2 inputs without associated <label> elements. Screen readers will announce them as 'Edit text', providing no context to the user.",
    priority: "high",
    effort: "low",
    impact: "Accessible to screen reader users",
  },
  {
    category: "accessibility",
    title: "Improve keyboard navigation order",
    description:
      "The skip-to-content link is present but non-functional. Focus order in the navigation dropdown does not match visual order, causing confusion for keyboard users.",
    priority: "medium",
    effort: "medium",
    impact: "WCAG 2.1 success criterion 2.4.3",
  },
  {
    category: "ux",
    title: "Increase mobile tap target sizes",
    description:
      "8 interactive elements have tap targets smaller than 44×44 px. This causes mis-taps on mobile devices. The Google recommended minimum is 48×48 dp.",
    priority: "medium",
    effort: "low",
    impact: "Reduce mobile mis-tap rate",
  },
  {
    category: "ux",
    title: "Add loading states to async actions",
    description:
      "Form submissions and data fetches provide no visual feedback during loading. Users cannot distinguish between a slow server and a broken form.",
    priority: "medium",
    effort: "medium",
    impact: "Reduce user abandonment on slow connections",
  },
  {
    category: "conversion",
    title: "Move primary CTA above the fold",
    description:
      "On mobile (375 px), the primary CTA button is positioned 780 px from the top — well below the fold. Users who don't scroll never see it. Restructure the hero section.",
    priority: "high",
    effort: "medium",
    impact: "Estimated +15–25% CTA visibility",
  },
  {
    category: "conversion",
    title: "Add social proof elements",
    description:
      "The landing page has no testimonials, review counts, or trust badges. Adding 3–5 customer testimonials above the fold typically increases conversion by 15–20%.",
    priority: "medium",
    effort: "medium",
    impact: "Estimated +15–20% conversion rate",
  },
  {
    category: "conversion",
    title: "Reduce form field count",
    description:
      "The signup form collects 7 fields including optional information. Research shows reducing to 3–4 essential fields can double completion rates.",
    priority: "low",
    effort: "low",
    impact: "Estimated 2× form completion rate",
  },
];

// ── Builder ───────────────────────────────────────────────────────────────────

export function buildMockReport(
  auditId: string,
  url: string,
  createdAt: string,
): AuditReportResponse {
  const categoryIds: CategoryId[] = [
    "performance",
    "seo",
    "security",
    "accessibility",
    "ux",
    "conversion",
  ];

  // Build category scores seeded from url
  const categories: CategoryScore[] = categoryIds.map((id) => {
    const score = hashScore(url, id);
    const grade = scoreToGrade(score);
    return {
      id,
      label: CATEGORY_META[id].label,
      score,
      grade,
      summary: CATEGORY_META[id].summaryTemplate(score),
    };
  });

  // Overall score = weighted average (performance and SEO weighted higher)
  const weights: Record<CategoryId, number> = {
    performance: 0.25,
    seo: 0.20,
    security: 0.20,
    accessibility: 0.15,
    ux: 0.10,
    conversion: 0.10,
  };

  const overallScore = Math.round(
    categories.reduce((sum, cat) => sum + cat.score * weights[cat.id], 0),
  );
  const overallGrade = scoreToGrade(overallScore);

  // Select a realistic subset of recommendations
  const recommendations: Recommendation[] = REC_BANK.slice(0, 12).map(
    (rec, i) => ({ ...rec, id: recId(rec.category, i) }),
  );

  const completedAt = new Date(
    new Date(createdAt).getTime() + 19_000,
  ).toISOString();

  return {
    auditId,
    url,
    completedAt,
    overallScore,
    overallGrade,
    summary:
      overallScore >= 75
        ? `${url} performs well overall, with strong SEO and security posture. Key improvements are available in performance and accessibility.`
        : `${url} has significant issues across multiple categories. Priority fixes in performance and security will have the highest impact on user experience and search rankings.`,
    categories,
    recommendations,
    screenshots: {
      // Using placeholder images — real GCS URLs will be injected in Step 8.2
      desktopUrl: "https://placehold.co/1280x800/111111/6366f1?text=Desktop+Screenshot",
      mobileUrl: "https://placehold.co/390x844/111111/6366f1?text=Mobile+Screenshot",
    },
    metadata: {
      lighthouseVersion: "12.2.1",
      userAgent:
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      fetchTime: createdAt,
      environment: "mock",
    },
  };
}
