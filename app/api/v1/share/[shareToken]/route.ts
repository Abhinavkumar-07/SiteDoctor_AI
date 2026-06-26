// app/api/v1/audits/[auditId]/status/route.ts
// UNCHANGED from Step 8.1.

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