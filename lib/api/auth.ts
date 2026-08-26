"use server";

import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "./server";
import {
  setAuthCookies,
  clearAuthCookies,
  readAccessToken,
  readRefreshToken,
} from "./cookies";
import type { AuthResponse, AuthRole, Business, LoginResponse } from "./types";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * What the login screen needs to route and greet, for either kind of user.
 * A staff login carries no business, so the greeting name is resolved here
 * rather than leaving the caller to reach into a field that may not exist.
 */
export type LoginResult = {
  role: AuthRole;
  /** Business name for an owner, the worker's own name for staff. */
  displayName: string;
  /** True only for a worker still on their temporary password. */
  mustChangePassword: boolean;
};

export async function loginAction(input: {
  /** An email for an owner, a username for a worker. */
  identifier: string;
  password: string;
}): Promise<ActionResult<LoginResult>> {
  try {
    const data = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: input,
      auth: false,
    });
    await setAuthCookies({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      role: data.role,
      // Written explicitly either way, so signing in as an owner on a device
      // a worker used clears the flag instead of inheriting it.
      mustChangePassword:
        data.role === "STAFF" ? data.mustChangePassword : false,
    });
    return {
      ok: true,
      data:
        data.role === "STAFF"
          ? {
              role: "STAFF",
              displayName: data.staff.name,
              mustChangePassword: data.mustChangePassword,
            }
          : {
              role: "OWNER",
              displayName: data.business.name,
              mustChangePassword: false,
            },
    };
  } catch (err) {
    return { ok: false, error: humanError(err, "Login failed") };
  }
}

export async function registerAction(input: {
  name: string;
  email: string;
  password: string;
}): Promise<ActionResult<{ business: Business }>> {
  try {
    const data = await apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: input,
      auth: false,
    });
    // Registration always creates an owner — /auth/register has no staff path.
    await setAuthCookies({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      role: "OWNER",
      mustChangePassword: false,
    });
    return { ok: true, data: { business: data.business } };
  } catch (err) {
    return { ok: false, error: humanError(err, "Could not create account") };
  }
}

export async function logoutAction(): Promise<void> {
  try {
    await apiFetch<void>("/auth/logout", { method: "POST" });
  } catch {
    // Logout is best-effort; clear local cookies regardless.
  }
  await clearAuthCookies();
  redirect("/login");
}

export async function isAuthenticated(): Promise<boolean> {
  if ((await readAccessToken()) !== null) return true;
  return (await readRefreshToken()) !== null;
}

/**
 * Always resolves to `{ ok: true }`. The backend never reveals whether the
 * email exists, and we mirror that here — transport / 5xx failures are
 * swallowed so an attacker can't distinguish "valid email" from "API down"
 * by the response. The form shows the same "check your inbox" state in
 * every case.
 */
export async function forgotPasswordAction(input: {
  email: string;
}): Promise<ActionResult> {
  try {
    await apiFetch<{ ok: true }>("/auth/forgot-password", {
      method: "POST",
      body: input,
      auth: false,
    });
  } catch {
    // Intentionally swallowed — see the docblock above.
  }
  return { ok: true, data: undefined };
}

export async function resetPasswordAction(input: {
  email: string;
  token: string;
  password: string;
}): Promise<ActionResult> {
  try {
    await apiFetch<{ ok: true }>("/auth/reset-password", {
      method: "POST",
      body: input,
      auth: false,
    });
    // Reset invalidates every existing session on the backend; clear local
    // cookies too in case this tab somehow had a stale session.
    await clearAuthCookies();
    return { ok: true, data: undefined };
  } catch (err) {
    return {
      ok: false,
      error: humanError(err, "Reset link is invalid or has expired"),
    };
  }
}

export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult> {
  try {
    const data = await apiFetch<AuthResponse>("/auth/change-password", {
      method: "POST",
      body: input,
    });
    // Backend rotates the refresh token — adopt the new pair so this device
    // stays signed in while every other session is invalidated.
    await setAuthCookies({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: humanError(err, "Could not update password") };
  }
}

function humanError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
