// app/api/v1/audits/[auditId]/report/route.ts
//
// GET /api/v1/audits/:auditId/report
//
// Returns the full audit report.
// Returns 404 if the audit does not exist or has not completed yet.

import { NextRequest } from "next/server";
import { getAuditReport } from "@/lib/services/report.service";
import { ok, withErrorHandling } from "@/lib/utils/api-response";

interface RouteContext {
  params: Promise<{ auditId: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { auditId } = await context.params;
    const report = await getAuditReport(auditId);
    return ok(report);
  });
}