// lib/container/index.ts
//
// The dependency container for the entire backend.
//
// This is the ONLY file that knows which concrete class implements each
// interface.  Everything else (services, pipeline, repositories) receives
// deps through this container — they never import from lib/mock directly.
//
// ── Migration path ────────────────────────────────────────────────────────────
// To swap a mock for a real implementation in Step 8.3+:
//
//   1. Create the real class in lib/integrations/ (e.g. GcsStorageProvider).
//   2. Import it here.
//   3. Replace the Mock* assignment below with the real class.
//   4. Done — no other file changes.
//
// All services, repositories, and pipeline stages are untouched.
// ─────────────────────────────────────────────────────────────────────────────

import type { IAuditStore } from "@/lib/interfaces/i-audit-store";
import type { IAuditEngine } from "@/lib/interfaces/i-audit-engine";
import type { IScreenshotProvider } from "@/lib/interfaces/i-screenshot-provider";
import type { IStorageProvider } from "@/lib/interfaces/i-storage-provider";
import type { IReportGenerator } from "@/lib/interfaces/i-report-generator";
import type { IRecommendationGenerator } from "@/lib/interfaces/i-recommendation-generator";

import {
  MockAuditStore,
  MockStorageProvider,
  MockReportGenerator,
  MockRecommendationGenerator,
  MockScreenshotProvider,
} from "@/lib/mock";

import { LighthouseAuditEngine }
from "@/lib/integrations/lighthouse/lighthouse-audit-engine";

// ── Container type ────────────────────────────────────────────────────────────

export interface AppContainer {
  auditStore: IAuditStore;
  auditEngine: IAuditEngine;
  screenshotProvider: IScreenshotProvider;
  storageProvider: IStorageProvider;
  reportGenerator: IReportGenerator;
  recommendationGenerator: IRecommendationGenerator;
}

// ── Singleton via globalThis (survives Next.js hot-reload) ────────────────────



declare global {
  // eslint-disable-next-line no-var
  var __sitedoctor_container__: AppContainer | undefined;
}

function buildContainer(): AppContainer {
  return {
    auditStore: new MockAuditStore(),

    auditEngine: new LighthouseAuditEngine(),

    screenshotProvider: new MockScreenshotProvider(),

    storageProvider: new MockStorageProvider(),

    reportGenerator: new MockReportGenerator(),

    recommendationGenerator:
      new MockRecommendationGenerator(),
  };
}

export function getContainer(): AppContainer {
  if (!globalThis.__sitedoctor_container__) {
    console.log("Creating NEW container");
    globalThis.__sitedoctor_container__ = buildContainer();
  } else {
    console.log("Reusing existing container");
  }

  return globalThis.__sitedoctor_container__;
}