import "server-only";

import { cookies } from "next/headers";

import type { AuthRole } from "./types";

export const ACCESS_COOKIE = "acroma_access";
export const REFRESH_COOKIE = "acroma_refresh";
export const ROLE_COOKIE = "acroma_role";
export const MUST_CHANGE_PASSWORD_COOKIE = "acroma_must_change_password";

const ACCESS_TTL_SECONDS = 60 * 15; // 15 min — matches backend access expiry
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

const isSecure = process.env.COOKIE_SECURE === "true";

/** Shared flags. Everything session-scoped is written the same way. */
const cookieOptions = {
  httpOnly: true,
  secure: isSecure,
  sameSite: "lax",
  path: "/",
} as const;

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
  /**
   * Whether the worker signing in is still on the temporary password they
   * were handed. Like `role`, only login knows it: `undefined` leaves the
   * cookie alone so a token refresh can't wipe the flag, `true` sets it, and
   * `false` clears it so a fresh login never inherits the last person's.
   */
  mustChangePassword?: boolean;
};

export async function setAuthCookies({
  accessToken,
  refreshToken,
  role,
  mustChangePassword,
}: SetTokensInput) {
  const store = await cookies();

  // Server Components can't write cookies — silently no-op so a refresh
  // triggered from a layout/page doesn't blow up. The next Server Action or
  // Route Handler that touches auth will persist fresh tokens.
  try {
    store.set(ACCESS_COOKIE, accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_TTL_SECONDS,
    });

    if (refreshToken) {
      store.set(REFRESH_COOKIE, refreshToken, {
        ...cookieOptions,
        maxAge: REFRESH_TTL_SECONDS,
      });
    }

    if (role) {
      store.set(ROLE_COOKIE, role, {
        ...cookieOptions,
        maxAge: REFRESH_TTL_SECONDS,
      });
    }

    if (mustChangePassword === true) {
      store.set(MUST_CHANGE_PASSWORD_COOKIE, "1", {
        ...cookieOptions,
        maxAge: REFRESH_TTL_SECONDS,
      });
    } else if (mustChangePassword === false) {
      store.delete(MUST_CHANGE_PASSWORD_COOKIE);
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
    store.delete(MUST_CHANGE_PASSWORD_COOKIE);
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

/**
 * Drops the forced-password-change flag. Called once the worker has actually
 * chosen their own password, which is the only thing that ends the forced
 * screen short of signing out.
 */
export async function clearMustChangePassword() {
  const store = await cookies();
  try {
    store.delete(MUST_CHANGE_PASSWORD_COOKIE);
  } catch {
    // Read-only cookie store (Server Component) — ignore.
  }
}

/**
 * Whether the signed-in worker still owes us a password change, for server
 * components deciding whether to force the screen.
 *
 * Same caveat as `readRole`: a convenience, never a security boundary. The
 * backend is what actually keeps a worker on a temporary password honest.
 */
export async function readMustChangePassword(): Promise<boolean> {
  const store = await cookies();
  return store.get(MUST_CHANGE_PASSWORD_COOKIE)?.value === "1";
}
