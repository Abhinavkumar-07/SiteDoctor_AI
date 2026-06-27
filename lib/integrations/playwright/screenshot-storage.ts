// lib/integrations/playwright/screenshot-storage.ts
//
// Abstraction for screenshot persistence.
//
// Step 8.3:
//   LocalScreenshotStorage implements this interface.
//
// Step 8.4+:
//   GcsScreenshotStorage can implement the same contract.
//
// PlaywrightScreenshotProvider depends only on this interface.

export interface ScreenshotStorage {
  save(
    auditId: string,
    viewport: "desktop" | "mobile",
    buffer: Buffer,
  ): Promise<string>;
}