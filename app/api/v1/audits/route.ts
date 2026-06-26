// app/api/v1/audits/route.ts
//
// POST /api/v1/audits
// UNCHANGED from Step 8.1 — route handlers are not touched in Step 8.2.
// The service layer handles all architectural changes below this point.

import { NextRequest } from "next/server";
import { createAuditSchema } from "@/lib/validations/create-audit.schema";
import { createAudit } from "@/lib/services/audit.service";
import { ok, withErrorHandling } from "@/lib/utils/api-response";
import { Errors } from "@/lib/types/api-errors";

export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw Errors.validation({ message: "Request body must be valid JSON." });
    }

    const result = createAuditSchema.safeParse(body);
    if (!result.success) {
      throw Errors.validation(result.error.flatten().fieldErrors);
    }

    const response = await createAudit(result.data.url);
    return ok(response, 201);
  });
}