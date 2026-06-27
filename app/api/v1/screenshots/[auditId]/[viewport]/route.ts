// app/api/v1/screenshots/[auditId]/[viewport]/route.ts
//
// Serves locally stored screenshots back to the frontend.
// Only active in Step 8.3 while screenshots live on the local filesystem.
//
// Step 8.4 migration:
//   When GCS is wired in, screenshots are stored at public GCS URLs and
//   this route is no longer needed.  Remove it and remove LocalScreenshotStorage.
//   The GCS URLs are returned directly by PlaywrightScreenshotProvider.capture().
//
// Security note:
//   - auditId is validated against the known format (audit_ + 32 hex chars).
//   - viewport is constrained to the enum {"desktop", "mobile"}.
//   - Path traversal is prevented by both validation and path.join() behaviour.

import { NextRequest, NextResponse } from "next/server";
import { LocalScreenshotStorage } from "@/lib/integrations/playwright/local-screenshot-storage";

interface RouteContext {
  params: Promise<{ auditId: string; viewport: string }>;
}

// Strict validation to prevent path traversal
const AUDIT_ID_PATTERN = /^audit_[0-9a-f]{32}$/;
const VALID_VIEWPORTS = new Set(["desktop", "mobile"]);

export async function GET(_req: NextRequest, context: RouteContext) {
  const { auditId, viewport } = await context.params;

  // Validate inputs
  if (!AUDIT_ID_PATTERN.test(auditId)) {
    return NextResponse.json(
      { error: "Invalid audit ID.", code: "NOT_FOUND" },
      { status: 404 },
    );
  }

  if (!VALID_VIEWPORTS.has(viewport)) {
    return NextResponse.json(
      { error: "Invalid viewport. Must be 'desktop' or 'mobile'.", code: "NOT_FOUND" },
      { status: 404 },
    );
  }

  try {
  const storage = new LocalScreenshotStorage();

  const typedViewport = viewport as "desktop" | "mobile";

  const exists = await storage.exists(
    auditId,
    typedViewport
  );

  if (!exists) {
    return NextResponse.json(
      {
        error: "Screenshot not found.",
        code: "NOT_FOUND",
      },
      { status: 404 }
    );
  }

  const buffer = await storage.read(
    auditId,
    typedViewport
  );

  return new NextResponse(
    new Uint8Array(buffer),
    {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control":
          "public, max-age=3600, immutable",
      },
    }
  );

} catch (error) {
  console.error(
    `[ScreenshotRoute] failed for ${auditId}/${viewport}`,
    error
  );

  return NextResponse.json(
    {
      error: "Failed to serve screenshot.",
      code: "INTERNAL_SERVER_ERROR",
    },
    { status: 500 }
  );

}
}