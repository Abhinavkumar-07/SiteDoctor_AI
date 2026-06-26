// lib/mock/mock-status.ts
//
// Generates a realistic AuditStatusResponse based on elapsed time since
// the audit was created.  No randomness — fully deterministic so the same
// auditId returns consistent progress on repeated polls.
//
// Timeline (wall-clock seconds since createdAt):
//  0–2   s  → queued        (0%)
//  2–4   s  → initializing  (10%)
//  4–6   s  → launching     (20%)
//  6–9   s  → lighthouse    (40%)
//  9–12  s  → screenshots   (60%)
//  12–16 s  → AI analysis   (80%)
//  16–19 s  → generating    (90%)
//  19+   s  → completed     (100%)

import type { AuditStatusResponse, AuditStage, AuditStatusValue } from "@/lib/types/audit-api";

interface StageDefinition {
  id: string;
  label: string;
  startSec: number;  // elapsed seconds when this stage becomes "running"
  endSec: number;    // elapsed seconds when this stage becomes "done"
}

const STAGE_DEFINITIONS: StageDefinition[] = [
  { id: "queued",        label: "Queued",              startSec: 0,  endSec: 2  },
  { id: "initializing",  label: "Initializing",        startSec: 2,  endSec: 4  },
  { id: "browser",       label: "Launching Browser",   startSec: 4,  endSec: 6  },
  { id: "lighthouse",    label: "Running Lighthouse",  startSec: 6,  endSec: 9  },
  { id: "screenshot",    label: "Capturing Screenshots", startSec: 9, endSec: 12 },
  { id: "ai",            label: "Running AI Analysis", startSec: 12, endSec: 16 },
  { id: "generating",    label: "Generating Report",   startSec: 16, endSec: 19 },
];

const COMPLETE_SEC = 19;

function elapsedSeconds(createdAt: string): number {
  return (Date.now() - new Date(createdAt).getTime()) / 1000;
}

function buildStages(elapsed: number): AuditStage[] {
  return STAGE_DEFINITIONS.map((def) => {
    let status: AuditStage["status"];
    if (elapsed < def.startSec) {
      status = "pending";
    } else if (elapsed < def.endSec) {
      status = "running";
    } else {
      status = "done";
    }
    return { id: def.id, label: def.label, status };
  });
}

function computeProgress(elapsed: number): number {
  if (elapsed <= 0) return 0;
  if (elapsed >= COMPLETE_SEC) return 100;

  // Find which stage we're in and interpolate linearly within it
  const lastStage = STAGE_DEFINITIONS[STAGE_DEFINITIONS.length - 1];
  const totalDuration = lastStage.endSec;

  // Map each stage to a progress band
  const progressPerSec = 90 / totalDuration; // max progress before done = 90
  return Math.min(90, Math.round(elapsed * progressPerSec));
}

function computeOverallStatus(elapsed: number): AuditStatusValue {
  if (elapsed < 2) return "queued";
  if (elapsed >= COMPLETE_SEC) return "completed";
  return "processing";
}

export function buildMockStatus(
  auditId: string,
  url: string,
  createdAt: string,
): AuditStatusResponse {
  const elapsed = elapsedSeconds(createdAt);
  const status = computeOverallStatus(elapsed);
  const progress = status === "completed" ? 100 : computeProgress(elapsed);
  const stages = buildStages(elapsed);

  // Mark all stages as "done" when completed
  const finalStages: AuditStage[] =
    status === "completed"
      ? stages.map((s) => ({ ...s, status: "done" as const }))
      : stages;

  return {
    auditId,
    status,
    url,
    progress,
    stages: finalStages,
    reportSlug: status === "completed" ? auditId : undefined,
    createdAt,
    updatedAt: new Date().toISOString(),
  };
}
