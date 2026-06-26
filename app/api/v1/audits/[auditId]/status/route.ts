// app/api/v1/audits/[auditId]/status/route.ts
//
// GET /api/v1/audits/:auditId/status
//
// Returns the current processing status and stage progression.
// The frontend polls this every 3 seconds until status === "completed" | "failed".
//
// Responds with Cache-Control: no-store so browsers never cache status responses.

import { NextRequest } from "next/server";
import { getAuditStatus } from "@/lib/services/audit.service";
import { ok, withErrorHandling } from "@/lib/utils/api-response";

interface RouteContext {
  params: Promise<{ auditId: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { auditId } = await context.params;
    const status = await getAuditStatus(auditId);

    const response = ok(status);
    response.headers.set("Cache-Control", "no-store");
    return response;
  });
}