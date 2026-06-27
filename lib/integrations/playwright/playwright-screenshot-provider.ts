// lib/integrations/playwright/playwright-screenshot-provider.ts
//
// Implements IScreenshotProvider using Playwright.
// Acquires a shared Browser from BrowserManager, visits the URL in two
// separate BrowserContexts (desktop then mobile), saves the PNG buffers
// via ScreenshotStorage, and returns the public URLs.
//
// This class knows about:
//   - BrowserManager (lifecycle)
//   - visitPage (navigation + capture)
//   - ScreenshotStorage (persistence)
//
// This class does NOT know about:
//   - Where screenshots are stored (local vs GCS)
//   - How the report is generated
//   - Any service or repository

import type {
  IScreenshotProvider,
  ScreenshotResult,
} from "@/lib/interfaces/i-screenshot-provider";
import { BrowserManager } from "./browser-manager";
import { visitPage } from "./page-visitor";
import { CAPTURE_CONFIG } from "./capture-config";
import type { ScreenshotStorage } from "./screenshot-storage";

export class PlaywrightScreenshotProvider implements IScreenshotProvider {
  constructor(
    private readonly storage: ScreenshotStorage,
    private readonly auditId: string,
  ) {}

  async capture(url: string): Promise<ScreenshotResult> {
    const browser = await BrowserManager.acquire();

    // Capture desktop and mobile concurrently for speed
    const [desktopResult, mobileResult] = await Promise.allSettled([
      visitPage(browser, url, CAPTURE_CONFIG.desktop),
      visitPage(browser, url, CAPTURE_CONFIG.mobile),
    ]);

    let desktopUrl: string | null = null;
    let mobileUrl: string | null = null;

    if (desktopResult.status === "fulfilled") {
      desktopUrl = await this.storage.save(
        this.auditId,
        "desktop",
        desktopResult.value.screenshotBuffer,
      );
    } else {
      console.error(
        `[PlaywrightScreenshotProvider] desktop capture failed for ${url}:`,
        desktopResult.reason,
      );
    }

    if (mobileResult.status === "fulfilled") {
      mobileUrl = await this.storage.save(
        this.auditId,
        "mobile",
        mobileResult.value.screenshotBuffer,
      );
    } else {
      console.error(
        `[PlaywrightScreenshotProvider] mobile capture failed for ${url}:`,
        mobileResult.reason,
      );
    }

    // Non-fatal: partial results are valid
    // The frontend handles null screenshot URLs gracefully
    return { desktopUrl, mobileUrl };
  }
}
