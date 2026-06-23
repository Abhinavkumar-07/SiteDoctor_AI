"use client";

import type { ComponentProps } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Destination : components/layout/theme-provider.tsx
 * Dependencies: next-themes (in package.json — installed via npm install)
 * Imported by : app/layout.tsx
 *
 * Thin wrapper so layout.tsx stays a Server Component — next-themes needs
 * "use client" and can't live in a server file directly.
 *
 * Dark-mode token values are not yet designed (Frontend_Design_System.md is
 * light-only). Provider is wired for forward compatibility with
 * defaultTheme="light" and enableSystem={false} set at the call site in
 * layout.tsx — toggling to .dark today changes nothing visually.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
