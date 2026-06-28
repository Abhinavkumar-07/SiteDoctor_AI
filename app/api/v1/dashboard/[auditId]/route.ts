// app/api/v1/dashboard/[auditId]/route.ts
//
// DELETE /api/v1/dashboard/:auditId
//
// Deletes an audit and its report (cascade on DB).
// Auth guard added in Step 9 middleware.

import { NextRequest } from "next/server";
import { ok, withErrorHandling } from "@/lib/utils/api-response";
import { deleteAudit } from "@/lib/services/dashboard.service";

interface RouteContext {
  params: Promise<{ auditId: string }>;
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { auditId } = await context.params;
    await deleteAudit(auditId);
    return ok({ deleted: true });
  });
}