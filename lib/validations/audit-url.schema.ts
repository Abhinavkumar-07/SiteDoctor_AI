import { z } from "zod";

/**
 * Destination : lib/validations/audit-url.schema.ts
 * Dependencies: zod (in package.json)
 *
 * Client-side pre-flight validation only. The authoritative server-side
 * check (DNS resolution + SSRF guard) runs in POST /api/v1/audits.
 * Redundancy here is intentional — catching obvious problems client-side
 * gives faster feedback without a network round-trip.
 */

// ── Block lists ────────────────────────────────────────────────────────────────

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "[::1]",
]);

// Note: "http:" is intentionally NOT listed here — the HTTPS-only refine
// below already rejects it with a clearer, more specific message. Listing
// it here too just produced a redundant second error on the same value.
const BLOCKED_SCHEMES = new Set(["file:", "data:", "ftp:", "javascript:"]);

/**
 * RFC1918 private ranges + link-local (includes cloud metadata endpoint)
 * for IPv4, plus the IPv6 link-local and unique-local equivalents.
 *
 * This is defense-in-depth only — it matches literal IP-as-hostname input.
 * It does NOT protect against DNS rebinding (a public-looking domain that
 * resolves to a private IP); that is the server's job (see file header).
 */
const PRIVATE_IP_PATTERNS: RegExp[] = [
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/,
  /^192\.168\.\d{1,3}\.\d{1,3}$/,
  /^169\.254\.\d{1,3}\.\d{1,3}$/, // link-local / GCP metadata: 169.254.169.254
  /^\[fe[89ab][0-9a-f]:/i, // IPv6 link-local, fe80::/10 (AWS IMDSv6 lives here)
  /^\[f[cd][0-9a-f]{2}:/i, // IPv6 unique-local, fc00::/7
];

function isPrivateIp(hostname: string): boolean {
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(hostname));
}

function safeParseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

// ── Schema ─────────────────────────────────────────────────────────────────────

export const auditUrlSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, { message: "Enter a URL to get started." })
    /**
     * Normalize bare domains before the URL constructor runs.
     * "stripe.com" → "https://stripe.com"
     * Keeps the UX friendly — users shouldn't have to type the scheme.
     */
    .transform((value) => {
      // Case-insensitive: schemes are case-insensitive per RFC 3986, and
      // mobile keyboards routinely auto-capitalize the first character of
      // a freshly-focused field (e.g. "https://x.com" -> "Https://x.com").
      // A case-sensitive startsWith here would miss that and prepend a
      // second "https://", producing an unparseable URL.
      return /^https?:\/\//i.test(value) ? value : `https://${value}`;
    })
    .pipe(
      z
        .string()
        // 1. Must be a parseable URL
        .refine(
          (value) => safeParseUrl(value) !== null,
          { message: "Enter a valid URL, like https://example.com." }
        )
        // 2. HTTPS only
        .refine(
          (value) => safeParseUrl(value)?.protocol === "https:",
          { message: "Only HTTPS URLs are supported." }
        )
        // 3. No blocked schemes (catches file://, data://, etc.)
        .refine(
          (value) => {
            const protocol = safeParseUrl(value)?.protocol ?? "";
            return !BLOCKED_SCHEMES.has(protocol);
          },
          { message: "This URL scheme is not supported." }
        )
        // 4. No localhost or loopback
        .refine(
          (value) => {
            const hostname = safeParseUrl(value)?.hostname.toLowerCase() ?? "";
            return !BLOCKED_HOSTNAMES.has(hostname);
          },
          {
            message:
              "Local and loopback addresses cannot be audited. Enter a public URL.",
          }
        )
        // 5. No private IP ranges
        .refine(
          (value) => {
            const hostname = safeParseUrl(value)?.hostname ?? "";
            return !isPrivateIp(hostname);
          },
          {
            message:
              "Private IP addresses cannot be audited. Enter a public URL.",
          }
        )
        // 6. Must have a real hostname with a TLD
        .refine(
          (value) => {
            const hostname = safeParseUrl(value)?.hostname ?? "";
            return hostname.includes(".") && hostname.length > 3;
          },
          { message: "Enter a valid public domain, like https://example.com." }
        )
    ),
});

export type AuditUrlInput = z.input<typeof auditUrlSchema>;
export type AuditUrlOutput = z.output<typeof auditUrlSchema>;
