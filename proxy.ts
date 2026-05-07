import { NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE = "acroma_access";
const REFRESH_COOKIE = "acroma_refresh";

/**
 * Edge auth gate.
 * Runs before every matched request. Cheap defense-in-depth — the
 * dashboard layout still verifies the session against the backend.
 *
 * - Unauthenticated traffic to /dashboard/* is bounced to /login.
 * - Already-authenticated traffic to /login or /register goes to /dashboard.
 *
 * "Authenticated" here means: an access OR refresh cookie is present.
 * The actual validation happens server-side in the layout.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasSession =
    request.cookies.has(ACCESS_COOKIE) || request.cookies.has(REFRESH_COOKIE);

  const inDashboard = pathname.startsWith("/dashboard");
  const inOnboarding = pathname.startsWith("/onboarding");
  const inAuth = pathname === "/login" || pathname === "/register";

  if ((inDashboard || inOnboarding) && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (inAuth && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/login", "/register"],
};
