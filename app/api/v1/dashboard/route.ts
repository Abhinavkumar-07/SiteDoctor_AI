// app/api/v1/dashboard/route.ts
//
// GET  /api/v1/dashboard  — paginated, filterable audit list
// DELETE /api/v1/dashboard/:auditId  — handled via separate file (Step 9)
//
// Query params:
//   page     (default 1)
//   limit    (default 9, max 50)
//   search   (optional URL substring)
//   minScore (optional integer 0–100)
//
// Route is intentionally thin: parse → validate → service → respond.
// Auth guard added in Step 9 middleware — no changes needed here.

import { NextRequest } from "next/server";
import { ok, withErrorHandling } from "@/lib/utils/api-response";
import { listAudits } from "@/lib/services/dashboard.service";
import type { DashboardAuditRow } from "@/lib/interfaces/i-dashboard-store";

export interface DashboardResponse {
  audits: DashboardAuditRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 9;

export async function GET(req: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = req.nextUrl;

    const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1",              10));
    const limit = Math.min(MAX_LIMIT,
                  Math.max(1, parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10)));
    const search   = searchParams.get("search")   ?? undefined;
    const minScore = searchParams.has("minScore")
      ? Math.min(100, Math.max(0, parseInt(searchParams.get("minScore")!, 10)))
      : undefined;

    const { rows, total } = await listAudits({ page, limit, search, minScore });

    const response: DashboardResponse = {
      audits: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return ok(response);
  });
}