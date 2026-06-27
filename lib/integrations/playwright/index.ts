// lib/integrations/playwright/index.ts
//
// Public surface of the Playwright integration module.
// Only these exports are imported by the container.
// Internal helpers (BrowserManager, visitPage, etc.) are not exported
// to prevent them from leaking into the rest of the codebase.

export { PlaywrightScreenshotProvider } from "./playwright-screenshot-provider";
export { PlaywrightAuditEngine } from "./playwright-audit-engine";
export { BrowserManager } from "./browser-manager";

export { LocalScreenshotStorage } from "./local-screenshot-storage";

export type { ScreenshotStorage } from "./screenshot-storage";