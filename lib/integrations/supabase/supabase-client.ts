// lib/integrations/supabase/supabase-client.ts
//
// Singleton Supabase client for server-side use only.
// Uses the SERVICE_ROLE key — bypasses RLS, never exposed to the browser.
//
// ── Auth note ─────────────────────────────────────────────────────────────────
// Supabase Auth is disabled in Step 8.6.
// When auth is introduced (Step 9+), this client stays as-is for service-level
// operations. A separate `createServerClient` using cookies will be added for
// user-scoped queries.
//
// ── Env vars ─────────────────────────────────────────────────────────────────
// SUPABASE_URL          — project URL, e.g. https://xxxx.supabase.co
// SUPABASE_SERVICE_ROLE_KEY — service role JWT (never expose client-side)
//
// Both must be present in .env.local for local dev and in the deployment
// environment for production.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const GLOBAL_KEY = "__sitedoctor_supabase_client__";

declare global {
  // eslint-disable-next-line no-var
  var __sitedoctor_supabase_client__: SupabaseClient | undefined;
}

function buildClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "[SupabaseClient] Missing env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
    );
  }

  return createClient(url, key, {
    auth: {
      // Server-side service role client — no session management needed
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export function getSupabaseClient(): SupabaseClient {
  // Singleton — survives Next.js hot-reload via globalThis
  if (!globalThis[GLOBAL_KEY]) {
    globalThis[GLOBAL_KEY] = buildClient();
  }
  return globalThis[GLOBAL_KEY]!;
}
