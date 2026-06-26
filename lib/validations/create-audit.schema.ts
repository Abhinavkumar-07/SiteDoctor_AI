// lib/validations/create-audit.schema.ts
//
// Zod schema for the POST /api/v1/audits request body.
// Note: lib/validations/audit-url.schema.ts already exists (frontend form).
// This file is the backend counterpart — stricter, used in route handlers.

import { z } from "zod";

export const createAuditSchema = z.object({
  url: z
    .string({ required_error: "url is required." })
    .trim()
    .min(1, "url must not be empty.")
    .refine(
      (v) => {
        try {
          const parsed = new URL(v);
          return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch {
          return false;
        }
      },
      {
        message: "url must be a valid http or https URL.",
      },
    ),
});

export type CreateAuditInput = z.infer<typeof createAuditSchema>;
