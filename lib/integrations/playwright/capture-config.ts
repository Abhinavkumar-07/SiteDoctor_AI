// lib/integrations/playwright/capture-config.ts
//
// All Playwright capture settings in one place.
// Changing viewport sizes, timeouts, or wait strategies is a single-file edit.

export const CAPTURE_CONFIG = {
  // Viewport dimensions — must match the frontend screenshot display sizes
  desktop: {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    isMobile: false,
  },
  mobile: {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },

  // Navigation timeout (ms) — raise on slow target sites
  navigationTimeoutMs: 30_000,

  // Extra wait after load to let deferred JS settle
  postLoadWaitMs: 1_500,

  // Screenshot format
  screenshotType: "png" as const,

  // Page metadata extraction
  metadataSelector: {
    title: "title",
    description: 'meta[name="description"]',
    ogImage: 'meta[property="og:image"]',
    canonical: 'link[rel="canonical"]',
    h1: "h1",
  },

  // Local storage base path for temporary screenshots
  // Step 8.3: local filesystem  →  Step 8.4+: GCS
  localStoragePath: ".storage/screenshots",
} as const;
