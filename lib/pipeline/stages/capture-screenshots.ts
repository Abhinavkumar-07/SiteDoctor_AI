// lib/pipeline/stages/capture-screenshots.ts
//
// Pipeline stage 2: Screenshot capture.
// Delegates entirely to IScreenshotProvider — knows nothing about Playwright.
// In Step 8.1–8.2 the provider returns placeholder URLs.
// In Step 8.3+ a real Playwright provider is injected via the container.

import type { IScreenshotProvider, ScreenshotResult } from "@/lib/interfaces";

export async function captureScreenshots(
  url: string,
  provider: IScreenshotProvider,
): Promise<ScreenshotResult> {
  return provider.capture(url);
}
