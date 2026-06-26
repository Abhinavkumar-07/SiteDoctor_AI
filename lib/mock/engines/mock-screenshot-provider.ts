// lib/mock/engines/mock-screenshot-provider.ts
//
// Satisfies IScreenshotProvider using static placeholder image URLs.
// No browser is launched. Returns placehold.co URLs that the frontend
// can display while real Playwright is not yet wired in.
// Replaced by PlaywrightScreenshotProvider in Step 8.3+.

import type {
  IScreenshotProvider,
  ScreenshotResult,
} from "@/lib/interfaces/i-screenshot-provider";

export class MockScreenshotProvider implements IScreenshotProvider {
  async capture(_url: string): Promise<ScreenshotResult> {
    return {
      desktopUrl:
        "https://placehold.co/1280x800/111111/6366f1?text=Desktop+Screenshot",
      mobileUrl:
        "https://placehold.co/390x844/111111/6366f1?text=Mobile+Screenshot",
    };
  }
}
