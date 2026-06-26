// lib/utils/api-response.ts
//
// Thin wrappers around NextResponse.json() so every route handler
// uses the same Content-Type, status code, and body shape.

import { NextResponse } from "next/server";
import { ApiError } from "@/lib/types/api-errors";
import type { ApiErrorBody } from "@/lib/types/api-errors";

/** Return a 200 JSON success response. */
export function ok<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

/** Return a typed error response from an ApiError instance. */
export function apiError(err: ApiError): NextResponse<ApiErrorBody> {
  return NextResponse.json(err.toBody(), { status: err.statusCode });
}

/**
 * Wrap a route handler body in a try/catch.
 * - ApiError instances are converted to their HTTP representation.
 * - All other errors become 500 responses.
 * - Unexpected values are safely stringified.
 */
export async function withErrorHandling(
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (err) {
    if (err instanceof ApiError) {
      return apiError(err);
    }
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error("[SiteDoctor API]", err);
    return NextResponse.json(
      { error: message, code: "INTERNAL_SERVER_ERROR" } satisfies ApiErrorBody,
      { status: 500 },
    );
  }
}
