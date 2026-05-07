import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/api/cookies";

/**
 * Route handler that clears stale auth cookies and bounces to /login.
 *
 * Server Components can READ cookies but can't WRITE them, so when the
 * dashboard layout discovers a 401 it can't clear the dead cookies itself —
 * if it just redirected to /login, proxy.ts would still see the cookies and
 * redirect right back to /dashboard, looping forever.
 *
 * This handler runs at the network boundary, deletes both cookies, and lets
 * the browser land on /login fresh.
 */
export async function GET(request: Request) {
  const url = new URL("/login", request.url);
  const response = NextResponse.redirect(url);
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}
