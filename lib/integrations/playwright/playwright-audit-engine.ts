// lib/integrations/playwright/playwright-audit-engine.ts
//
// Implements IAuditEngine using real Playwright screenshot capture.
// Status progression is still time-based (identical to MockAuditEngine)
// because Lighthouse is not yet integrated — that arrives in Step 8.4.
//
// buildReport():
//   1. Captures real desktop + mobile screenshots via Playwright.
//   2. Builds the report body via MockReportGenerator (scores are still
//      seeded from the URL hash until Lighthouse data is available).
//   3. Injects the real screenshot URLs into the report.
//
// This engine is what the container registers in Step 8.3.
// In Step 8.4, buildReport() adds: runLighthouse() between capture and report.
import type { IAuditEngine } from "@/lib/interfaces/i-audit-engine";
import type {
  AuditStatusResponse,
  AuditReportResponse,
  AuditStage,
  AuditStatusValue,
} from "@/lib/types/audit-api";
import { buildMockReport } from "@/lib/mock";
import { PlaywrightScreenshotProvider } from "./playwright-screenshot-provider";
import { LocalScreenshotStorage } from "./local-screenshot-storage";

// ── Status progression (identical to MockAuditEngine) ────────────────────────
// Kept here so PlaywrightAuditEngine is self-contained.
// Step 8.4 will replace this with real job-status polling.

interface StageDef {
  id: string;
  label: string;
  startSec: number;
  endSec: number;
}

const STAGES: StageDef[] = [
  { id: "queued",       label: "Queued",                startSec: 0,  endSec: 2  },
  { id: "initializing", label: "Initializing",          startSec: 2,  endSec: 4  },
  { id: "browser",      label: "Launching Browser",     startSec: 4,  endSec: 6  },
  { id: "lighthouse",   label: "Running Lighthouse",    startSec: 6,  endSec: 9  },
  { id: "screenshot",   label: "Capturing Screenshots", startSec: 9,  endSec: 12 },
  { id: "ai",           label: "Running AI Analysis",   startSec: 12, endSec: 16 },
  { id: "generating",   label: "Generating Report",     startSec: 16, endSec: 19 },
];

const COMPLETE_SEC = 19;

function elapsedSec(createdAt: string): number {
  return (Date.now() - new Date(createdAt).getTime()) / 1000;
}

export class PlaywrightAuditEngine implements IAuditEngine {
  // ── getStatus — time-based, no real job query yet ──────────────────────────
  getStatus(
    auditId: string,
    url: string,
    createdAt: string,
  ): AuditStatusResponse {
    const sec = elapsedSec(createdAt);

    const overallStatus: AuditStatusValue =
      sec < 2 ? "queued" : sec >= COMPLETE_SEC ? "completed" : "processing";

    const progress =
      overallStatus === "completed"
        ? 100
        : Math.min(90, Math.round((sec / COMPLETE_SEC) * 90));

    const stages: AuditStage[] = STAGES.map((def) => ({
      id: def.id,
      label: def.label,
      status:
        overallStatus === "completed"
          ? "done"
          : sec < def.startSec
            ? "pending"
            : sec < def.endSec
              ? "running"
              : "done",
    }));

    return {
      auditId,
      status: overallStatus,
      url,
      progress,
      stages,
      reportSlug: overallStatus === "completed" ? auditId : undefined,
      createdAt,
      updatedAt: new Date().toISOString(),
    };
  }

  // ── buildReport — real screenshots, mock scores (until Step 8.4) ──────────
  async buildReport(
    auditId: string,
    url: string,
    createdAt: string,
  ): Promise<AuditReportResponse> {
    // Step 8.3: capture real screenshots, store locally
    const storage = new LocalScreenshotStorage();
    const screenshotProvider = new PlaywrightScreenshotProvider(storage, auditId);

    let screenshotResult = { desktopUrl: null as string | null, mobileUrl: null as string | null };

    try {
      screenshotResult = await screenshotProvider.capture(url);
    } catch (err) {
      // Screenshot failure is non-fatal — report still returns with null URLs
      console.error(`[PlaywrightAuditEngine] screenshot capture failed:`, err);
    }

    // Build the rest of the report using mock data (scores, recommendations)
    // Step 8.4 will replace buildMockReport() with real Lighthouse data
    const mockReport = buildMockReport(auditId, url, createdAt);

    // Inject real screenshot URLs over the placeholder values
    return {
      ...mockReport,
      screenshots: {
        desktopUrl: screenshotResult.desktopUrl,
        mobileUrl: screenshotResult.mobileUrl,
      },
    };
  }
}
