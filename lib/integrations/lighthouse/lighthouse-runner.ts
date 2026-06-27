// lib/integrations/lighthouse/lighthouse-runner.ts

// Runs Lighthouse using a dedicated headless Chromium instance
// launched via chrome-launcher.
//
// Playwright remains responsible for screenshots.
// Lighthouse remains responsible for scores.
//
// This keeps both systems isolated and avoids CDP integration issues.

//
// ── Why CDP port bridging? ────────────────────────────────────────────────────
// Lighthouse expects a Chrome DevTools Protocol (CDP) endpoint, not a
// Playwright Browser object. 
// random debugging port.  We retrieve that port via `browser.wsEndpoint()`
// and pass it to Lighthouse as `port`.  This avoids launching a second
// Chrome process and reuses the warm instance from Step 8.3.
//
// ── Lighthouse config ─────────────────────────────────────────────────────────
// We run the "navigation" strategy on desktop by default.
// Mobile emulation is handled by passing the mobile preset.
// Only the categories we use are enabled to minimise audit time.
//
// ── Step 8.5 migration ────────────────────────────────────────────────────────
// When Supabase lands, store the raw `lhr` JSON blob in an `audit_results`
// table so reports can be re-parsed without re-running Lighthouse.
// This file does not change — the caller (LighthouseAuditEngine) handles
// persistence.

import lighthouse from "lighthouse";
import type { Result as LHResult } from "lighthouse";
import { launch } from "chrome-launcher";
// Categories we audit — enabling only these keeps the run under ~15 s
const ENABLED_CATEGORIES = [
  "performance",
  "accessibility",
  "seo",
  "best-practices",
] as const;

export type EnabledCategory = (typeof ENABLED_CATEGORIES)[number];

// The subset of the Lighthouse result we actually use downstream
export interface LighthouseRunResult {
  lhr: LHResult;
  /** Milliseconds the Lighthouse run took */
  durationMs: number;
}

export interface LighthouseRunOptions {
  /** "desktop" (default) or "mobile" */
  formFactor?: "desktop" | "mobile";
}

/**
 * Run Lighthouse against `url` using the shared BrowserManager Chromium
 * instance.  Returns the raw Lighthouse result object.
 *
 * Throws if Lighthouse fails to complete — callers should wrap in try/catch
 * and fall back to mock scores if needed.
 */
export async function runLighthouse(
  url: string,
  options: LighthouseRunOptions = {},
): Promise<LighthouseRunResult> {

  const chrome = await launch({

    chromeFlags: [

      "--headless",

      "--disable-gpu",

      "--no-sandbox"

    ]

  });

  const startMs = Date.now();

  try {

    console.log("Chrome port:", chrome.port);

    console.log("Starting Lighthouse");

    const result = await lighthouse(

      url,

      {

        port: chrome.port,

        output: "json",

        logLevel: "info",

        onlyCategories: [

          "performance",

          "accessibility",

          "seo",

          "best-practices",

        ],

      }

    );

    console.log("Lighthouse finished");

    if (!result?.lhr) {

      throw new Error(

        `[LighthouseRunner] Lighthouse returned no result for ${url}`

      );

    }

    return {

      lhr: result.lhr as LHResult,

      durationMs: Date.now() - startMs,

    };

  }

  finally {

    await chrome.kill();

  }

}