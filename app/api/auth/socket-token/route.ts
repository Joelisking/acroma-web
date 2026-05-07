import { NextResponse } from "next/server";
import { readAccessToken } from "@/lib/api/cookies";

/**
 * Returns the current access token to the browser for Socket.IO handshake use.
 *
 * Why this exists: the access token lives in an HTTP-only cookie so JS can't
 * read it. Socket.IO needs it in `auth: { token }` though, so we expose it
 * via a small same-origin endpoint. The token is short-lived (15 min) and
 * the refresh token never crosses this boundary.
 */
export async function GET() {
  const token = await readAccessToken();
  if (!token) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  return NextResponse.json(
    { accessToken: token },
    { headers: { "Cache-Control": "no-store" } },
  );
}
