import Link from "next/link";

/**
 * Destination : components/layout/navbar.tsx
 * Dependencies: next/link (built into Next.js — no install needed)
 * Imported by : app/layout.tsx
 *
 * Per UI_Blueprint.md §1 — the MVP nav is deliberately minimal. There is
 * barely enough navigation to justify a mobile hamburger menu, so this
 * stays a static Server Component with no client-side state.
 *
 * Mobile: logo only (the "How it works" link is hidden below sm breakpoint).
 * Desktop: logo + "How it works" anchor link.
 */
export function Navbar() {
  return (
    <header className="border-b border-neutral-200 bg-paper">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6"
      >
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-lg font-semibold text-ink hover:opacity-80 transition-opacity"
        >
          SiteDoctor AI
        </Link>

        {/* Single nav link — hidden on mobile, visible from sm up */}
        <Link
          href="/#how-it-works"
          className="hidden font-body text-sm text-slate transition-colors hover:text-ink sm:block"
        >
          How it works
        </Link>
      </nav>
    </header>
  );
}
