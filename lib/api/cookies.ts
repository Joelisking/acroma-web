import "server-only";

import { cookies } from "next/headers";

import type { AuthRole } from "./types";

export const ACCESS_COOKIE = "acroma_access";
export const REFRESH_COOKIE = "acroma_refresh";
export const ROLE_COOKIE = "acroma_role";

const ACCESS_TTL_SECONDS = 60 * 15; // 15 min — matches backend access expiry
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

const isSecure = process.env.COOKIE_SECURE === "true";

type SetTokensInput = {
  accessToken: string;
  refreshToken?: string;
  /**
   * Who is signed in. Only login knows this, so it is optional — a token
   * refresh must not wipe the role it never received. It rides the refresh
   * TTL because it has to outlive the 15-minute access token, and it is
   * cleared alongside the tokens so a stale role can't outlive the session.
   */
  role?: AuthRole;
};

export async function setAuthCookies({
  accessToken,
  refreshToken,
  role,
}: SetTokensInput) {
  const store = await cookies();

  // Server Components can't write cookies — silently no-op so a refresh
  // triggered from a layout/page doesn't blow up. The next Server Action or
  // Route Handler that touches auth will persist fresh tokens.
  try {
    store.set(ACCESS_COOKIE, accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TTL_SECONDS,
    });

    if (refreshToken) {
      store.set(REFRESH_COOKIE, refreshToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        path: "/",
        maxAge: REFRESH_TTL_SECONDS,
      });
    }

    if (role) {
      store.set(ROLE_COOKIE, role, {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        path: "/",
        maxAge: REFRESH_TTL_SECONDS,
      });
    }
  } catch {
    // Read-only cookie store (Server Component) — ignore.
  }
}

export async function clearAuthCookies() {
  const store = await cookies();
  try {
    store.delete(ACCESS_COOKIE);
    store.delete(REFRESH_COOKIE);
    store.delete(ROLE_COOKIE);
  } catch {
    // Read-only cookie store (Server Component) — ignore.
  }
}

export async function readAccessToken() {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value ?? null;
}

export async function readRefreshToken() {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value ?? null;
}

/**
 * The signed-in role, for server components deciding what to render.
 *
 * This is a convenience, never a security boundary — the cookie is written by
 * us, but the backend is the only thing that decides what a token may do.
 * Sessions issued before roles existed carry no cookie, so a missing value
 * reads as the owner it in fact is.
 */
export async function readRole(): Promise<AuthRole> {
  const store = await cookies();
  return store.get(ROLE_COOKIE)?.value === "STAFF" ? "STAFF" : "OWNER";
}
