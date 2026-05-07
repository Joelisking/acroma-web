import { NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE = "acroma_access";
const REFRESH_COOKIE = "acroma_refresh";
const ACCESS_TTL_SECONDS = 60 * 15;

const isSecure = process.env.COOKIE_SECURE === "true";
const API_URL = process.env.ACROMA_API_URL;

/**
 * Edge auth gate.
 * Runs before every matched request.
 *
 * - Unauthenticated traffic to /dashboard/* or /onboarding/* is bounced to /login.
 * - Already-authenticated traffic to /login or /register goes to /dashboard.
 * - When the access cookie has expired but the refresh cookie is still valid,
 *   we refresh here at the network boundary and persist the new access cookie
 *   before letting the request through. Server Components can't write cookies,
 *   so doing this in lib/api/server.ts silently no-ops — the proxy is the only
 *   place the new token can actually land in the browser.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  const inDashboard = pathname.startsWith("/dashboard");
  const inOnboarding = pathname.startsWith("/onboarding");
  const inProtected = inDashboard || inOnboarding;
  const inAuth = pathname === "/login" || pathname === "/register";

  if (inProtected && !accessToken && !refreshToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (inAuth && (accessToken || refreshToken)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (inProtected && !accessToken && refreshToken) {
    const newAccess = await refreshAccessToken(refreshToken);
    if (newAccess) {
      const response = NextResponse.next();
      response.cookies.set(ACCESS_COOKIE, newAccess, {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        path: "/",
        maxAge: ACCESS_TTL_SECONDS,
      });
      return response;
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const response = NextResponse.redirect(url);
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
    return response;
  }

  return NextResponse.next();
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { accessToken?: string };
    return data.accessToken ?? null;
  } catch {
    return null;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/login", "/register"],
};
