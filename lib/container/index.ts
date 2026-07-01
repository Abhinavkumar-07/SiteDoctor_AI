// lib/container/index.ts
//
// Step 8.6 changes vs Step 8.4:
//   - auditStore:     MockAuditStore       → SupabaseAuditStore
//   - reportStore:    (new)                → SupabaseReportStore
//   - dashboardStore: (new)                → SupabaseDashboardStore
//   All three fall back to Mock* when Supabase env vars are absent.
//
// LighthouseAuditEngine is unchanged.
// All other slots are unchanged.
//
// ── Step 9 migration (Auth) ────────────────────────────────────────────────────
// No changes needed here — auth is handled at the route/middleware level.

import type { IAuditStore } from "@/lib/interfaces/i-audit-store";
import type { IAuditEngine } from "@/lib/interfaces/i-audit-engine";
import type { IScreenshotProvider } from "@/lib/interfaces/i-screenshot-provider";
import type { IStorageProvider } from "@/lib/interfaces/i-storage-provider";
import type { IReportGenerator } from "@/lib/interfaces/i-report-generator";
import type { IRecommendationGenerator } from "@/lib/interfaces/i-recommendation-generator";
import type { IReportStore } from "@/lib/interfaces/i-report-store";
import type { IDashboardStore } from "@/lib/interfaces/i-dashboard-store";
import type { IAuditEventStore }
from "@/lib/interfaces/i-audit-event-store";
// ── Mock implementations ──────────────────────────────────────────────────────
import {
  MockAuditStore,
  MockStorageProvider,
  MockReportGenerator,
  MockRecommendationGenerator,
  MockScreenshotProvider,
  MockReportStore,
  MockDashboardStore,
  MockAuditEventStore,
} from "@/lib/mock";

// ── Real implementations ──────────────────────────────────────────────────────
import { LighthouseAuditEngine } from "@/lib/integrations/lighthouse";
import {
  SupabaseAuditStore,
  SupabaseReportStore,
  SupabaseDashboardStore,
  SupabaseAuditEventStore,
} from "@/lib/integrations/supabase";

// ── Container type ────────────────────────────────────────────────────────────

export interface AppContainer {
  auditStore: IAuditStore;
  auditEngine: IAuditEngine;
  screenshotProvider: IScreenshotProvider;
  storageProvider: IStorageProvider;
  reportGenerator: IReportGenerator;
  recommendationGenerator: IRecommendationGenerator;
  reportStore: IReportStore;
  dashboardStore: IDashboardStore;
  auditEventStore: IAuditEventStore;
}

// ── Env-var guard ─────────────────────────────────────────────────────────────

function isSupabaseConfigured(): boolean {
  return (
    !!process.env.SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// ── Singleton via globalThis ──────────────────────────────────────────────────

const GLOBAL_KEY = "__sitedoctor_container__";

declare global {
  // eslint-disable-next-line no-var
  var __sitedoctor_container__: AppContainer | undefined;
}

function buildContainer(): AppContainer {
  const useSupabase = isSupabaseConfigured();
  console.log(
    "Supabase enabled:",
    useSupabase
  );

  if (!useSupabase) {
    console.warn(
      "[Container] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. " +
        "Falling back to in-memory mock stores.",
    );
  }

  return {
    // ── Step 8.6: Real Supabase stores (mock fallback if env vars absent) ────
    auditStore:     useSupabase ? new SupabaseAuditStore()     : new MockAuditStore(),
    reportStore:    useSupabase ? new SupabaseReportStore()    : new MockReportStore(),
    dashboardStore: useSupabase ? new SupabaseDashboardStore() : new MockDashboardStore(),
    auditEventStore: useSupabase ? new SupabaseAuditEventStore() : new MockAuditEventStore(),
    
    // ── Step 8.4: Real Lighthouse engine (unchanged) ─────────────────────────
    auditEngine: new LighthouseAuditEngine(),

    // ── Still mocked (Step 9+ replaces these) ────────────────────────────────
    screenshotProvider:      new MockScreenshotProvider(),
    storageProvider:         new MockStorageProvider(),
    reportGenerator:         new MockReportGenerator(),
    recommendationGenerator: new MockRecommendationGenerator(),
  };
}

export function getContainer(): AppContainer {
  if (!globalThis[GLOBAL_KEY]) {
    globalThis[GLOBAL_KEY] = buildContainer();
  }
  return globalThis[GLOBAL_KEY]!;
}