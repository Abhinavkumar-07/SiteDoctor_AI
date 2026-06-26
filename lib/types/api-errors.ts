// lib/types/api-errors.ts
//
// Unified error shape for every API route in the v1 namespace.
// All routes return { error, code, details? } on failure.
// Never throw plain strings — always use ApiError.

export type ApiErrorCode =
  | "VALIDATION_ERROR"       // 400 — Zod or manual validation failure
  | "NOT_FOUND"              // 404 — audit / report / share token missing
  | "METHOD_NOT_ALLOWED"     // 405
  | "INTERNAL_SERVER_ERROR"  // 500 — unexpected runtime failure
  | "SERVICE_UNAVAILABLE";   // 503 — external service not ready

export interface ApiErrorBody {
  error: string;
  code: ApiErrorCode;
  details?: unknown;
}

/**
 * Typed error class. Thrown inside service functions and
 * caught in route handlers, which convert them to NextResponse.
 */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: ApiErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  toBody(): ApiErrorBody {
    return {
      error: this.message,
      code: this.code,
      ...(this.details !== undefined ? { details: this.details } : {}),
    };
  }
}

// ── Convenience factories ─────────────────────────────────────────────────────

export const Errors = {
  notFound: (resource: string) =>
    new ApiError(404, "NOT_FOUND", `${resource} not found.`),

  validation: (details: unknown) =>
    new ApiError(400, "VALIDATION_ERROR", "Request validation failed.", details),

  internal: (message = "An unexpected error occurred.") =>
    new ApiError(500, "INTERNAL_SERVER_ERROR", message),

  serviceUnavailable: (message = "Service temporarily unavailable.") =>
    new ApiError(503, "SERVICE_UNAVAILABLE", message),
} as const;
