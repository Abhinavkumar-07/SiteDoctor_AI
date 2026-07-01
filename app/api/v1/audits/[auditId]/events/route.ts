// app/api/v1/audits/[auditId]/events/route.ts
//
// GET /api/v1/audits/:auditId/events
//
// Returns the ordered event timeline for a given audit.
// Events are emitted by ReportRepository and ShareRepository at lifecycle
// boundaries: processing → lighthouse → report_generation → completed | failed.
//
// Returns an empty array for audits that exist but have no events yet
// (e.g. status still "queued").
// Returns 404 for unknown auditId.

import { NextRequest } from "next/server";
import { ok, withErrorHandling } from "@/lib/utils/api-response";
import { getAuditEvents } from "@/lib/services/audit-events.service";

interface RouteContext {
  params: Promise<{ auditId: string }>;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { auditId } = await context.params;
    const events = await getAuditEvents(auditId);
    return ok({ auditId, events });
  });
}