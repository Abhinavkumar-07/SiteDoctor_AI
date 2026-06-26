// lib/pipeline/stages/validate-url.ts
//
// Pipeline stage 1: URL validation.
// Accepts a raw string, ensures it is a valid http/https URL.
// Throws ApiError on failure so the pipeline halts cleanly.
//
// No external dependencies — pure logic, easy to unit test.

import { Errors } from "@/lib/types/api-errors";

export interface ValidatedUrl {
  raw: string;
  normalised: string; // trimmed, lowercased scheme+host, original path
}

export function validateUrl(raw: string): ValidatedUrl {
  const trimmed = raw.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw Errors.validation({
      url: ["Must be a valid URL (e.g. https://example.com)."],
    });
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw Errors.validation({
      url: ["URL must use the http or https protocol."],
    });
  }

  return {
    raw: trimmed,
    normalised: trimmed,
  };
}
