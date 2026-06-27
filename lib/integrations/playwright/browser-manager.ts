// lib/integrations/playwright/browser-manager.ts
//
// Owns the Playwright Browser lifecycle.
// A single Browser instance is reused across requests in the same
// Node.js process to avoid the ~1 s cold-start cost of launching
// Chromium on every audit.
//
// Concurrency model:
//   Each capture call creates a fresh BrowserContext (isolated cookie jar,
//   cache, etc.) and a fresh Page.  They are torn down after capture.
//   The Browser itself stays alive until the process exits or reset() is
//   called (e.g. after a crash, in tests).
//
// Lifecycle:
//   acquire() → launch if not running, return browser
//   release()  → close current context/page (called by provider, not this module)
//   reset()    → force-close the browser (used in tests / error recovery)
//
// Step 8.4 note:
//   Lighthouse will call acquire() too and reuse the same browser, so
//   the ~1 s launch cost is paid only once per cold-start.

import { chromium } from "playwright";
import type { Browser } from "playwright";

const GLOBAL_KEY = "__sitedoctor_pw_browser__";

declare global {
  // eslint-disable-next-line no-var
  var __sitedoctor_pw_browser__: Browser | undefined;
}

export const BrowserManager = {
  async acquire(): Promise<Browser> {
    // Re-use existing browser if it is still connected
    if (globalThis[GLOBAL_KEY]?.isConnected()) {
      return globalThis[GLOBAL_KEY]!;
    }

    const browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // avoids /dev/shm OOM on Linux containers
        "--disable-gpu",
        // "--single-process",        // reduces memory footprint in serverless
      ],
    });

    globalThis[GLOBAL_KEY] = browser;
    return browser;
  },

  async reset(): Promise<void> {
    const browser = globalThis[GLOBAL_KEY];
    if (browser) {
      try {
        await browser.close();
      } catch {
        // Already closed — ignore
      } finally {
        globalThis[GLOBAL_KEY] = undefined;
      }
    }
  },

  isRunning(): boolean {
    return !!globalThis[GLOBAL_KEY]?.isConnected();
  },
};
