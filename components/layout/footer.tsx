import Link from "next/link";

/**
 * Destination : components/layout/footer.tsx
 * Dependencies: next/link (built into Next.js — no install needed)
 * Imported by : app/layout.tsx
 *
 * Minimal footer per UI_Blueprint.md §1 Landing Page spec.
 * Renders on every route via the root layout — do NOT add it again
 * inside individual page files.
 */

const FOOTER_LINKS = [
  { href: "/docs", label: "Docs" },
  { href: "/about", label: "About" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-paper">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm sm:flex-row sm:px-6">
        <p className="font-body text-slate">
          © {new Date().getFullYear()} SiteDoctor AI
        </p>

        <nav aria-label="Footer navigation" className="flex gap-6">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-body text-slate transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
