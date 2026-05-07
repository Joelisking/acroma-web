import "server-only";

import { cookies } from "next/headers";

export const ACCESS_COOKIE = "acroma_access";
export const REFRESH_COOKIE = "acroma_refresh";

const ACCESS_TTL_SECONDS = 60 * 15; // 15 min — matches backend access expiry
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

const isSecure = process.env.COOKIE_SECURE === "true";

type SetTokensInput = {
  accessToken: string;
  refreshToken?: string;
};

export async function setAuthCookies({ accessToken, refreshToken }: SetTokensInput) {
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
  } catch {
    // Read-only cookie store (Server Component) — ignore.
  }
}

export async function clearAuthCookies() {
  const store = await cookies();
  try {
    store.delete(ACCESS_COOKIE);
    store.delete(REFRESH_COOKIE);
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
