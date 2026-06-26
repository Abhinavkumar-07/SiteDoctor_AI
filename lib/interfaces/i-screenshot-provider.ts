// lib/interfaces/i-screenshot-provider.ts
//
// Contract for capturing desktop and mobile screenshots of a URL.
// In Step 8.1–8.2: MockScreenshotProvider returns placeholder URLs.
// In Step 8.3+: PlaywrightScreenshotProvider launches a headless browser.

export interface ScreenshotResult {
  desktopUrl: string | null;
  mobileUrl: string | null;
}

export interface IScreenshotProvider {
  /**
   * Capture desktop (1280×800) and mobile (390×844) screenshots.
   * Uploads images and returns their public URLs.
   * Returns null fields if capture fails non-fatally.
   */
  capture(url: string): Promise<ScreenshotResult>;
}
