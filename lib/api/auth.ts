"use server";

import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "./server";
import {
  setAuthCookies,
  clearAuthCookies,
  readAccessToken,
  readRefreshToken,
} from "./cookies";
import type { AuthResponse, Business } from "./types";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function loginAction(input: {
  email: string;
  password: string;
}): Promise<ActionResult<{ business: Business }>> {
  try {
    const data = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: input,
      auth: false,
    });
    await setAuthCookies({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    return { ok: true, data: { business: data.business } };
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
    await setAuthCookies({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
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
