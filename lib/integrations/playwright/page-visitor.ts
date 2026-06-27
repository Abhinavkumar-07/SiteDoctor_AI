// lib/integrations/playwright/page-visitor.ts
//
// Single responsibility: open a URL in a Playwright BrowserContext,
// extract metadata, and capture a screenshot buffer.
// Does NOT know about storage — returns raw Buffer.
// Does NOT know about the IScreenshotProvider interface.
//
// Separating navigation from storage means:
//   - Unit tests can test metadata extraction without touching the filesystem.
//   - Replacing storage (local → GCS) never touches this file.

import type { Browser, BrowserContext, Page } from "playwright";
import { CAPTURE_CONFIG } from "./capture-config";
import type { PageMetadata } from "./page-metadata";

export interface ViewportConfig {
  width: number;
  height: number;
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch?: boolean;
}

export interface VisitResult {
  screenshotBuffer: Buffer;
  metadata: PageMetadata;
}

async function extractMetadata(page: Page): Promise<PageMetadata> {
  const cfg = CAPTURE_CONFIG.metadataSelector;

  const [title, description, ogImage, canonicalUrl, h1] = await Promise.all([
    page.$eval(cfg.title, (el) => el.textContent?.trim() ?? null).catch(() => null),
    page
      .$eval(cfg.description, (el) => el.getAttribute("content"))
      .catch(() => null),
    page
      .$eval(cfg.ogImage, (el) => el.getAttribute("content"))
      .catch(() => null),
    page
      .$eval(cfg.canonical, (el) => el.getAttribute("href"))
      .catch(() => null),
    page
      .$eval(cfg.h1, (el) => el.textContent?.trim() ?? null)
      .catch(() => null),
  ]);

  // Capture load timing via Navigation Timing API
  const loadTimeMs = await page
    .evaluate<number | null>(() => {
      const timing = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming | undefined;
      if (!timing) return null;
      return Math.round(timing.loadEventEnd - timing.startTime);
    })
    .catch(() => null);

  return {
    title,
    description,
    ogImage,
    canonicalUrl,
    h1,
    resolvedUrl: page.url(),
    httpStatus: null, // populated below from response
    loadedSuccessfully: true,
    loadTimeMs,
  };
}

export async function visitPage(
  browser: Browser,
  url: string,
  viewport: ViewportConfig,
): Promise<VisitResult> {
  let context: BrowserContext | null = null;
  let httpStatus: number | null = null;

  try {
    context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: viewport.deviceScaleFactor,
      isMobile: viewport.isMobile,
      hasTouch: viewport.hasTouch ?? false,
      // Ignore HTTPS errors (self-signed certs on dev sites)
      ignoreHTTPSErrors: true,
      // Realistic user-agent
      userAgent:
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 SiteDoctor/1.0",
    });

    const page = await context.newPage();

    // Intercept the main frame response to capture HTTP status
    page.on("response", (response) => {
      if (
        response.url() === url ||
        response.url().replace(/\/$/, "") === url.replace(/\/$/, "")
      ) {
        httpStatus = response.status();
      }
    });

    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: CAPTURE_CONFIG.navigationTimeoutMs,
    });

    // Let deferred JS finish settling
    await page.waitForTimeout(CAPTURE_CONFIG.postLoadWaitMs);

    const metadata = await extractMetadata(page);
    metadata.httpStatus = httpStatus;

    const screenshotBuffer = await page.screenshot({
      type: CAPTURE_CONFIG.screenshotType,
      fullPage: true, // above-the-fold only (matches viewport)
    });

    return { screenshotBuffer: Buffer.from(screenshotBuffer), metadata };
  } finally {
    // Always close the context — isolates each audit completely
    if (context) {
      await context.close().catch(() => {
        /* ignore close errors */
      });
    }
  }
}
