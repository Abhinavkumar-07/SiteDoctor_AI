// app/dashboard/page.tsx
import type { Metadata } from "next";
import { LayoutDashboard } from "lucide-react";
import { DashboardClient } from "./_components/dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard — SiteDoctor AI",
  description: "View your audit history, search past reports, and track site health over time.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16 space-y-8">
        {/* Page header */}
        <header className="space-y-1">
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className="h-5 w-5 text-primary" aria-hidden />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Recent audits, history, and site health over time.
          </p>
        </header>

        {/* Client shell — owns all data fetching and interactions */}
        <DashboardClient />
      </div>
    </main>
  );
}
