// app/api/v1/share/[shareToken]/route.ts
//
// GET /api/v1/share/:shareToken
//
// Returns the publicly accessible shared report.
// Returns 404 if the token is invalid or the report is not ready.
// Returns 410 if the share link has expired (handled in service in Step 8.2+).

import { NextRequest } from "next/server";
import { getSharedReport } from "@/lib/services/share.service";
import { ok, withErrorHandling } from "@/lib/utils/api-response";

interface RouteContext {
  params: Promise<{ shareToken: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { shareToken } = await context.params;
    const report = await getSharedReport(shareToken);
    return ok(report);
  });
}  