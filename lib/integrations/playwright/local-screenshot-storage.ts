// lib/integrations/playwright/local-screenshot-storage.ts
//
// Temporary local filesystem storage for screenshots in Step 8.3.
// Saves PNG buffers under CAPTURE_CONFIG.localStoragePath and returns
// a file:// URL that can be served back to the frontend via an API route.
//
// ── Step 8.4 migration ────────────────────────────────────────────────────────
// Replace this module with GcsScreenshotStorage that satisfies the same
// interface: save(auditId, viewport, buffer) → publicUrl.
// No other file changes — PlaywrightScreenshotProvider imports via the
// ScreenshotStorage interface below, not this concrete class.
// ─────────────────────────────────────────────────────────────────────────────

import { promises as fs } from "fs";
import path from "path";
import { CAPTURE_CONFIG } from "./capture-config";
import type { ScreenshotStorage } from "./screenshot-storage";


// ── Local implementation ──────────────────────────────────────────────────────

export class LocalScreenshotStorage implements ScreenshotStorage {
  private readonly basePath: string;

  constructor(basePath: string = CAPTURE_CONFIG.localStoragePath) {
    this.basePath = basePath;
  }

  async save(
    auditId: string,
    viewport: "desktop" | "mobile",
    buffer: Buffer,
  ): Promise<string> {
    const dir = path.join(this.basePath, auditId);
    await fs.mkdir(dir, { recursive: true });

    const filename = `${viewport}.png`;
    const filePath = path.join(dir, filename);
    await fs.writeFile(filePath, buffer);

    // Return an internal API URL that the Next.js screenshot-serve route
    // will resolve (created in this step).
    return `/api/v1/screenshots/${auditId}/${viewport}`;
  }

  async read(auditId: string, viewport: "desktop" | "mobile"): Promise<Buffer> {
    const filePath = path.join(
      this.basePath,
      auditId,
      `${viewport}.png`,
    );
    return fs.readFile(filePath);
  }

  async exists(
  auditId: string,
  viewport: "desktop" | "mobile",
): Promise<boolean> {
  const filePath = path.join(
    this.basePath,
    auditId,
    `${viewport}.png`,
  );

  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async remove(auditId: string): Promise<void> {
  const dir = path.join(this.basePath, auditId);

  try {
    await fs.rm(dir, {
      recursive: true,
      force: true,
    });
  } catch {}
}
}