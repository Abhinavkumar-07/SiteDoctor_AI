import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

/**
 * FONT NOTE — read before deploying to production:
 *
 * The Design System (Frontend_Design_System.md §2) specifies Söhne as the
 * display typeface. Söhne is a commercially licensed font by Klim Type Foundry
 * and must be purchased before production use:
 *   https://klim.co.nz/retail-fonts/sohne/
 *
 * For development, Plus Jakarta Sans is used as a free substitute with a
 * similar geometric, confident feel. To switch to Söhne when you have the
 * license:
 *
 *   1. Place the licensed .woff2 files in public/fonts/ (or assets/fonts/)
 *   2. Replace the import below with:
 *        import localFont from "next/font/local";
 *        const sohne = localFont({
 *          src: [
 *            { path: "../public/fonts/Sohne-Medium.woff2", weight: "500" },
 *            { path: "../public/fonts/Sohne-Semibold.woff2", weight: "600" },
 *          ],
 *          variable: "--font-display",
 *          display: "swap",
 *        });
 *   3. Replace `jakartaSans.variable` with `sohne.variable` in the className below.
 */
const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-display",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-data",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SiteDoctor AI — Know exactly what's wrong with your website",
    template: "%s — SiteDoctor AI",
  },
  description:
    "AI-powered website audits for performance, SEO, security, accessibility, UX, and conversion — in under a minute.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://sitedoctor.ai"
  ),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakartaSans.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <body className="font-body antialiased bg-paper text-ink">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
