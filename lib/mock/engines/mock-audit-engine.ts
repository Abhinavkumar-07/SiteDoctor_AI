// lib/mock/engines/mock-audit-engine.ts
//
// Satisfies IAuditEngine using deterministic time-based simulation.
// Status progresses over ~19 s from creation time.
// Report is seeded from the audited URL hash — same URL = same scores.
// Replaced by RealAuditEngine in Step 8.3+.

import type { IAuditEngine } from "@/lib/interfaces/i-audit-engine";
import type {
  AuditStatusResponse,
  AuditReportResponse,
  AuditStage,
  AuditStatusValue,
} from "@/lib/types/audit-api";
import { buildMockReport } from "@/lib/mock/generators/mock-report-data";

// ── Stage timeline ────────────────────────────────────────────────────────────

interface StageDef {
  id: string;
  label: string;
  startSec: number;
  endSec: number;
}

const STAGES: StageDef[] = [
  { id: "queued",       label: "Queued",               startSec: 0,  endSec: 2  },
  { id: "initializing", label: "Initializing",         startSec: 2,  endSec: 4  },
  { id: "browser",      label: "Launching Browser",    startSec: 4,  endSec: 6  },
  { id: "lighthouse",   label: "Running Lighthouse",   startSec: 6,  endSec: 9  },
  { id: "screenshot",   label: "Capturing Screenshots",startSec: 9,  endSec: 12 },
  { id: "ai",           label: "Running AI Analysis",  startSec: 12, endSec: 16 },
  { id: "generating",   label: "Generating Report",    startSec: 16, endSec: 19 },
];

const COMPLETE_SEC = 19;

function elapsed(createdAt: string): number {
  return (Date.now() - new Date(createdAt).getTime()) / 1000;
}

export class MockAuditEngine implements IAuditEngine {
  getStatus(
    auditId: string,
    url: string,
    createdAt: string,
  ): AuditStatusResponse {
    const sec = elapsed(createdAt);

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

  async buildReport(
    auditId: string,
    url: string,
    createdAt: string,
  ): Promise<AuditReportResponse> {
    return buildMockReport(auditId, url, createdAt);
  }
}
