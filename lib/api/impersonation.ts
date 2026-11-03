import "server-only"

import { cookies } from "next/headers"

import { adminFetch } from "@/lib/admin/api"

import {
  ACCESS_COOKIE,
  EMAIL_COOKIE,
  IMPERSONATION_COOKIE,
  MUST_CHANGE_PASSWORD_COOKIE,
  REFRESH_COOKIE,
  ROLE_COOKIE,
  clearAuthCookies,
  cookieOptions,
} from "./cookies"

export { IMPERSONATION_COOKIE }

/** What the banner shows while a super admin acts as a merchant. */
export type Impersonation = {
  businessId: string
  businessName: string
  currency: string
  sessionId: string
  expiresAt: string
}

/** Backend answer to `POST /super-admin/businesses/:id/impersonate`. */
export type ImpersonationStart = {
  accessToken: string
  sessionId: string
  expiresAt: string
  business: { id: string; name: string; currency: string }
}

// Ids go into backend paths and redirect URLs, so only plain id characters.
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

export function isSafeId(value: unknown): value is string {
  return typeof value === "string" && ID_PATTERN.test(value)
}

/** Parses the cookie value. Malformed → null. Expiry is not checked here. */
export function parseImpersonation(
  raw: string | undefined
): Impersonation | null {
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as Partial<Impersonation>
    if (
      !isSafeId(data.businessId) ||
      !isSafeId(data.sessionId) ||
      typeof data.businessName !== "string" ||
      typeof data.currency !== "string" ||
      typeof data.expiresAt !== "string" ||
      Number.isNaN(Date.parse(data.expiresAt))
    ) {
      return null
    }
    return {
      businessId: data.businessId,
      businessName: data.businessName,
      currency: data.currency,
      sessionId: data.sessionId,
      expiresAt: data.expiresAt,
    }
  } catch {
    return null
  }
}

/**
 * The impersonation in progress, or null. Display only: the access token is
 * what the backend trusts. An expired cookie is ended by proxy.ts before any
 * dashboard page renders.
 */
export async function readImpersonation(): Promise<Impersonation | null> {
  const store = await cookies()
  return parseImpersonation(store.get(IMPERSONATION_COOKIE)?.value)
}

/** True whenever the cookie exists at all, even malformed. Blocks refresh. */
export async function hasImpersonationCookie(): Promise<boolean> {
  const store = await cookies()
  return store.has(IMPERSONATION_COOKIE)
}

/**
 * Replaces any merchant login in this browser with the impersonation token.
 * The merchant refresh token is deleted so nothing can silently swap back to
 * (or into) another account mid-session. Route handlers only.
 */
export async function writeImpersonationCookies(start: ImpersonationStart) {
  const seconds = Math.floor((Date.parse(start.expiresAt) - Date.now()) / 1000)
  const maxAge = Math.max(seconds, 1)
  const value: Impersonation = {
    businessId: start.business.id,
    businessName: start.business.name,
    currency: start.business.currency,
    sessionId: start.sessionId,
    expiresAt: start.expiresAt,
  }

  const store = await cookies()
  store.set(ACCESS_COOKIE, start.accessToken, { ...cookieOptions, maxAge })
  store.delete(REFRESH_COOKIE)
  store.delete(MUST_CHANGE_PASSWORD_COOKIE)
  store.delete(EMAIL_COOKIE)
  store.set(ROLE_COOKIE, "OWNER", { ...cookieOptions, maxAge })
  store.set(IMPERSONATION_COOKIE, JSON.stringify(value), {
    ...cookieOptions,
    maxAge,
  })
}

/**
 * Ends the backend session (best effort: it's idempotent, and an already-gone
 * session or admin login must not trap the browser), then clears every
 * merchant cookie. Returns where the admin should land.
 */
export async function endImpersonation(): Promise<string> {
  const current = await readImpersonation()
  if (current) {
    try {
      await adminFetch<void>(
        `/super-admin/impersonations/${encodeURIComponent(current.sessionId)}`,
        { method: "DELETE", onUnauthorized: "throw" }
      )
    } catch {
      // 404 / 401 / network: the session expires on its own within the hour.
    }
  }
  await clearAuthCookies()
  return current ? `/admin/businesses/${current.businessId}` : "/admin"
}
