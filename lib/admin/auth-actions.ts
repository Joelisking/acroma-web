"use server";

import { redirect } from "next/navigation";

import {
  clearPendingCookie,
  clearSuperCookie,
  readPendingToken,
  readSuperToken,
  setPendingCookie,
  setSuperCookie,
} from "./cookies";
import type {
  AdminFormState,
  StartLoginResponse,
  VerifyTotpResponse,
} from "./types";

const THROTTLED = "Too many attempts, wait a minute and try again.";
const BAD_CREDENTIALS = "Those details didn't work. Check them and try again.";
const BAD_CODE = "That code didn't work. Check your authenticator and try again.";
const GENERIC = "Something went wrong. Try again.";

async function postAuth<T>(
  path: string,
  body: unknown,
  failure: string,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const apiUrl = process.env.ACROMA_API_URL;
  if (!apiUrl) return { ok: false, error: GENERIC };
  try {
    const res = await fetch(`${apiUrl}/super-admin/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (res.status === 429) return { ok: false, error: THROTTLED };
    if (res.status === 400 || res.status === 401) return { ok: false, error: failure };
    if (!res.ok) return { ok: false, error: GENERIC };
    return { ok: true, data: (await res.json()) as T };
  } catch {
    return { ok: false, error: GENERIC };
  }
}

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function startLoginAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const email = field(formData, "email");
  const password = formData.get("password");
  if (!email || typeof password !== "string" || !password) {
    return { error: BAD_CREDENTIALS };
  }

  const result = await postAuth<StartLoginResponse>(
    "login",
    { email, password },
    BAD_CREDENTIALS,
  );
  if (!result.ok) return { error: result.error };

  await setPendingCookie(result.data.pendingToken);
  redirect("/admin/login");
}

export async function verifyTotpAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const pendingToken = await readPendingToken();
  if (!pendingToken) redirect("/admin/login");

  const code = field(formData, "code").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { error: BAD_CODE };

  const result = await postAuth<VerifyTotpResponse>(
    "verify-totp",
    { pendingToken, code },
    BAD_CODE,
  );
  if (!result.ok) return { error: result.error };

  await setSuperCookie(result.data.token, result.data.expiresAt);
  await clearPendingCookie();
  redirect("/admin");
}

/** Abandons step 2 so the user can start again with another account. */
export async function cancelLoginAction(): Promise<void> {
  await clearPendingCookie();
  redirect("/admin/login");
}

export async function logoutAction(): Promise<void> {
  const token = await readSuperToken();
  const apiUrl = process.env.ACROMA_API_URL;
  if (token && apiUrl) {
    try {
      await fetch(`${apiUrl}/super-admin/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
    } catch {
      // Session is dropped locally either way.
    }
  }
  await clearSuperCookie();
  redirect("/admin/login");
}
