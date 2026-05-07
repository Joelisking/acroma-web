"use server";

import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "./server";
import {
  setAuthCookies,
  clearAuthCookies,
  readAccessToken,
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
  return (await readAccessToken()) !== null;
}

function humanError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
