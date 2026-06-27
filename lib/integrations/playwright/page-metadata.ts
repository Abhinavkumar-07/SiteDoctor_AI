// lib/integrations/playwright/page-metadata.ts
//
// Typed shape for everything we extract from the DOM during a Playwright visit.
// This is internal to the integrations layer — not exposed via API responses.
// Step 8.4+: Lighthouse results will be merged with this metadata.

export interface PageMetadata {
  title: string | null;
  description: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  h1: string | null;
  /** Final URL after any redirects */
  resolvedUrl: string;
  /** HTTP status code of the final navigation */
  httpStatus: number | null;
  /** Whether the page loaded fully within the timeout */
  loadedSuccessfully: boolean;
  /** Wall-clock ms from navigationStart to loadEventEnd */
  loadTimeMs: number | null;
}
