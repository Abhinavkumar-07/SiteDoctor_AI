// lib/utils/id.ts
//
// Deterministic and random ID helpers used across the backend.
// Using crypto.randomUUID() — available in Node 18+ and all modern browsers.
// No external dependency needed.

/**
 * Generate a new random audit ID.
 * Format: "audit_<uuid-v4-without-dashes>"
 * Example: "audit_550e8400e29b41d4a716446655440000"
 */
export function generateAuditId(): string {
  const uuid = crypto.randomUUID().replace(/-/g, "");
  return `audit_${uuid}`;
}

/**
 * Derive a deterministic share token from an auditId.
 * In production this would be a signed JWT or a random token stored in DB.
 * For the mock layer, we use a simple base64url encoding so the token is
 * stable across requests and the share endpoint can reverse it.
 */
export function auditIdToShareToken(auditId: string): string {
  return Buffer.from(auditId).toString("base64url");
}

/**
 * Reverse a share token back to an auditId.
 * Returns null if the token is not valid base64url.
 */
export function shareTokenToAuditId(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    // Sanity check: decoded value must look like one of our audit IDs
    if (decoded.startsWith("audit_") && decoded.length === 38) {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Generate a unique recommendation ID scoped to a category.
 * Format: "rec_<category>_<index>"
 */
export function recId(category: string, index: number): string {
  return `rec_${category}_${index}`;
}
