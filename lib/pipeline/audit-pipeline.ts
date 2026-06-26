// lib/pipeline/audit-pipeline.ts
//
// Orchestrates the full audit creation flow.
// Each stage is a separate module — this file only wires them together.
//
// Current flow:
//   validateUrl → storeResult → return (async analysis is time-based in mock)
//
// Future flow (Step 8.3+, adding real stages):
//   validateUrl → captureScreenshots → runLighthouse → generateReport
//     → storeResult → return
//
// Adding a new stage = add one import + one await.  Nothing else changes.

import type { AppContainer } from "@/lib/container";
import type { CreateAuditResponse } from "@/lib/types/audit-api";
import { generateAuditId, auditIdToShareToken } from "@/lib/utils/id";
import { validateUrl } from "./stages/validate-url";
import { storeResult } from "./stages/store-result";

export async function runCreateAuditPipeline(
  rawUrl: string,
  container: AppContainer,
): Promise<CreateAuditResponse> {
  // Stage 1 — validate
  const { normalised: url } = validateUrl(rawUrl);

  // Stage 2 — create record
  const auditId = generateAuditId();
  const createdAt = new Date().toISOString();
  const shareToken = auditIdToShareToken(auditId);

  // Stage 3 — persist
  await storeResult({ auditId, url, createdAt, shareToken }, container.auditStore);

  // Stage 4+ (Step 8.3+): captureScreenshots, runLighthouse, generateReport
  // will be inserted here between storeResult and return.

  return { auditId, status: "queued", createdAt };
}
