import { NextResponse } from "next/server"

import { AdminApiError, adminFetch } from "@/lib/admin/api"
import { requireSuperAdmin } from "@/lib/admin/auth"
import {
  type ImpersonationStart,
  isSafeId,
  writeImpersonationCookies,
} from "@/lib/api/impersonation"

/**
 * "Log in as": a plain form POST from the admin merchant page. Swaps this
 * browser's merchant session for a one-hour impersonation token and lands on
 * the merchant dashboard. Every exit is a 303 so the browser follows with GET.
 */
export async function POST(request: Request) {
  const to = (path: string) =>
    NextResponse.redirect(new URL(path, request.url), 303)

  // requireSuperAdmin() throws a redirect, which a route handler would answer
  // with 307 and the browser would re-POST to /admin/login. Answer 303 instead.
  try {
    await requireSuperAdmin()
  } catch {
    return to("/admin/login")
  }

  const form = await request.formData().catch(() => null)
  const businessId = form?.get("businessId")
  if (!isSafeId(businessId)) return to("/admin")

  const back = `/admin/businesses/${businessId}`
  let start: ImpersonationStart
  try {
    start = await adminFetch<ImpersonationStart>(
      `/super-admin/businesses/${encodeURIComponent(businessId)}/impersonate`,
      { method: "POST", onUnauthorized: "throw" }
    )
  } catch (err) {
    if (err instanceof AdminApiError && err.status === 401)
      return to("/admin/login")
    return to(back)
  }

  if (
    !start?.accessToken ||
    !isSafeId(start.sessionId) ||
    start.business?.id !== businessId ||
    !(Date.parse(start.expiresAt) > Date.now())
  ) {
    return to(back)
  }

  await writeImpersonationCookies(start)
  return to("/dashboard")
}
