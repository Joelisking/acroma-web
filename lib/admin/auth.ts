import "server-only";

import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "acroma_admin";

// 12h session TTL, in seconds.
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 12;

/**
 * Deterministic cookie value derived from the admin password. It's an
 * HMAC-SHA256 over a fixed message so we never store the raw password in the
 * cookie, and it can't be forged without knowing the password. Returns null
 * when the password env is unset (fail closed).
 */
export function adminCookieValue(): string | null {
  const password = process.env.ADMIN_DASHBOARD_PASSWORD;
  if (!password) return null;
  return crypto
    .createHmac("sha256", password)
    .update("acroma-admin-v1")
    .digest("hex");
}

/** Constant-time comparison that never throws on length mismatch. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * True only when the request carries a valid admin session cookie. Fails
 * closed if the password env or the cookie is missing.
 */
export async function isAdminAuthed(): Promise<boolean> {
  const expected = adminCookieValue();
  if (!expected) return false;

  const store = await cookies();
  const cookie = store.get(ADMIN_COOKIE)?.value;
  if (!cookie) return false;

  return safeEqual(cookie, expected);
}

/** Constant-time check of a submitted password against the configured one. */
export function verifyPassword(input: string): boolean {
  const password = process.env.ADMIN_DASHBOARD_PASSWORD;
  if (!password) return false;
  return safeEqual(input, password);
}
