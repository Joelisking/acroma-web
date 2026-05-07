import { NextResponse } from "next/server";
import { readAccessToken } from "@/lib/api/cookies";
import { tryRefresh } from "@/lib/api/server";

/**
 * Returns the current access token to the browser for Socket.IO handshake use.
 *
 * Why this exists: the access token lives in an HTTP-only cookie so JS can't
 * read it. Socket.IO needs it in `auth: { token }` though, so we expose it
 * via a small same-origin endpoint. The token is short-lived (15 min) and
 * the refresh token never crosses this boundary.
 *
 * If the access cookie has expired but the refresh cookie is still valid,
 * we refresh here at the route boundary (Route Handlers can write cookies)
 * so the socket can reconnect after an idle period without bouncing the
 * user back to /login.
 */
export async function GET() {
  let token = await readAccessToken();
  if (!token) {
    token = await tryRefresh();
  }
  if (!token) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  return NextResponse.json(
    { accessToken: token },
    { headers: { "Cache-Control": "no-store" } },
  );
}
