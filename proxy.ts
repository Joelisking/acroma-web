import { NextRequest, NextResponse } from "next/server"

const ACCESS_COOKIE = "acroma_access"
const REFRESH_COOKIE = "acroma_refresh"
// Mirrors lib/api/cookies.ts — the edge proxy can't import server-only code.
const IMPERSONATION_COOKIE = "acroma_impersonating"
const MERCHANT_COOKIES = [
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  "acroma_role",
  "acroma_must_change_password",
  "acroma_email",
  IMPERSONATION_COOKIE,
]
const ACCESS_TTL_SECONDS = 60 * 15

const isSecure = process.env.COOKIE_SECURE === "true"
const API_URL = process.env.ACROMA_API_URL

/**
 * Edge auth gate.
 * Runs before every matched request.
 *
 * - Unauthenticated traffic to /dashboard/* or /onboarding/* is bounced to /login.
 * - Already-authenticated traffic to /login or /register goes to /dashboard.
 * - While a super admin is acting as a merchant (impersonation cookie), the
 *   refresh path is skipped entirely; see the block below.
 * - When the access cookie has expired but the refresh cookie is still valid,
 *   we refresh here at the network boundary and persist the new access cookie
 *   before letting the request through. Server Components can't write cookies,
 *   so doing this in lib/api/server.ts silently no-ops — the proxy is the only
 *   place the new token can actually land in the browser.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value

  const inDashboard = pathname.startsWith("/dashboard")
  const inOnboarding = pathname.startsWith("/onboarding")
  const inProtected =
    inDashboard || inOnboarding || pathname === "/whatsapp/connect"
  const inAuth = pathname === "/login" || pathname === "/register"

  // "Log in as" in progress: never refresh, never fall back to a merchant
  // session. A dead impersonation (no access token, or past its expiry) is
  // cleared and the admin goes back to the merchant's admin page.
  const impersonation = request.cookies.get(IMPERSONATION_COOKIE)?.value
  if (impersonation !== undefined) {
    if (inAuth) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
    const { businessId, expired } = readImpersonation(impersonation)
    if (inProtected && (!accessToken || expired)) {
      const url = request.nextUrl.clone()
      url.pathname = businessId ? `/admin/businesses/${businessId}` : "/admin"
      url.search = ""
      const response = NextResponse.redirect(url)
      for (const name of MERCHANT_COOKIES) response.cookies.delete(name)
      return response
    }
    return NextResponse.next()
  }

  if (inProtected && !accessToken && !refreshToken) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (inAuth && (accessToken || refreshToken)) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  if (inProtected && !accessToken && refreshToken) {
    const newAccess = await refreshAccessToken(refreshToken)
    if (newAccess) {
      const response = NextResponse.next()
      response.cookies.set(ACCESS_COOKIE, newAccess, {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        path: "/",
        maxAge: ACCESS_TTL_SECONDS,
      })
      return response
    }
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    const response = NextResponse.redirect(url)
    response.cookies.delete(ACCESS_COOKIE)
    response.cookies.delete(REFRESH_COOKIE)
    return response
  }

  return NextResponse.next()
}

/** Reads just what the gate needs. Malformed counts as expired. */
function readImpersonation(raw: string): {
  businessId: string | null
  expired: boolean
} {
  try {
    const data = JSON.parse(raw) as { businessId?: unknown; expiresAt?: unknown }
    const businessId =
      typeof data.businessId === "string" &&
      /^[A-Za-z0-9_-]{1,64}$/.test(data.businessId)
        ? data.businessId
        : null
    const expiresAt =
      typeof data.expiresAt === "string" ? Date.parse(data.expiresAt) : NaN
    return {
      businessId,
      expired: !businessId || !(expiresAt > Date.now()),
    }
  } catch {
    return { businessId: null, expired: true }
  }
}

async function refreshAccessToken(
  refreshToken: string
): Promise<string | null> {
  if (!API_URL) return null
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    })
    if (!res.ok) return null
    const data = (await res.json()) as { accessToken?: string }
    return data.accessToken ?? null
  } catch {
    return null
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/login",
    "/register",
    "/whatsapp/connect",
  ],
}
