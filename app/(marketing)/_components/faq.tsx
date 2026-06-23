import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * Destination : app/(marketing)/_components/faq.tsx
 * Dependencies: @/components/ui/accordion
 *               (shadcn — npx shadcn@latest add accordion)
 *
 * Every answer is grounded in a decision already made in the planning docs
 * rather than invented marketing copy:
 *   - Free / no signup  → PRD.md anonymous-by-default model
 *   - ~2 minutes        → PRD.md Non-Functional Requirements
 *   - What we check     → PRD.md Features Included in MVP
 *   - Bot-blocking      → ARCHITECTURE.md §9 Failure Handling
 */

const FAQS = [
  {
    question: "Is SiteDoctor AI free?",
    answer:
      "Yes. Running an audit is free and requires no account — paste a URL and get your full report.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No. Every audit gets its own shareable link the moment it's created, so you can run and view a report without signing up.",
  },
  {
    question: "How long does an audit take?",
    answer:
      "Usually under two minutes. You can watch live progress on the report page as each check completes — you don't have to wait on a loading screen.",
  },
  {
    question: "What does SiteDoctor AI actually check?",
    answer:
      "Performance (Core Web Vitals), SEO (titles, meta, headings, Open Graph), security (HTTPS, TLS, headers), and accessibility (labels, contrast, alt text) — plus AI-powered UX and conversion analysis tailored to your site's industry.",
  },
  {
    question: "What if my site can't be audited?",
    answer:
      "Some sites block automated browsers. If that happens we'll tell you clearly what went wrong rather than leave you guessing, and you can try again or contact us.",
  },
  {
    question: "Can I share my report?",
    answer:
      "Yes. Every report has a permanent public link — copy it and send it to a developer, client, or contractor. No login required to view it.",
  },
] as const;

export function Faq() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="mx-auto max-w-2xl px-4 py-16 sm:px-6"
    >
      <h2
        id="faq-heading"
        className="text-center font-display text-2xl font-semibold text-ink"
      >
        Frequently asked questions
      </h2>

      <Accordion type="single" collapsible className="mt-10 w-full">
        {FAQS.map((faq, index) => (
          <AccordionItem key={faq.question} value={`faq-${index}`}>
            <AccordionTrigger className="text-left font-body text-sm font-medium text-ink hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="font-body text-sm leading-relaxed text-slate">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
