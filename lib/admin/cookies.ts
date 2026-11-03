import "server-only";

import { cookies } from "next/headers";

export const SUPER_COOKIE = "acroma_super";
export const SUPER_PENDING_COOKIE = "acroma_super_pending";

const PENDING_TTL_SECONDS = 60 * 5;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: "lax",
  path: "/",
} as const;

/** Stores the session token until the backend's `expiresAt`. */
export async function setSuperCookie(token: string, expiresAt: string) {
  const seconds = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
  const store = await cookies();
  store.set(SUPER_COOKIE, token, {
    ...cookieOptions,
    maxAge: Math.max(seconds, 1),
  });
}

export async function readSuperToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SUPER_COOKIE)?.value ?? null;
}

/** Server Components can't write cookies, so a failed delete is ignored. */
export async function clearSuperCookie() {
  const store = await cookies();
  try {
    store.delete(SUPER_COOKIE);
  } catch {
    // Read-only cookie store (Server Component).
  }
}

export async function setPendingCookie(pendingToken: string) {
  const store = await cookies();
  store.set(SUPER_PENDING_COOKIE, pendingToken, {
    ...cookieOptions,
    maxAge: PENDING_TTL_SECONDS,
  });
}

export async function readPendingToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SUPER_PENDING_COOKIE)?.value ?? null;
}

export async function clearPendingCookie() {
  const store = await cookies();
  store.delete(SUPER_PENDING_COOKIE);
}
