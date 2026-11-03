import "server-only";

import { redirect } from "next/navigation";

import { readSuperToken } from "./cookies";

/**
 * Gate for admin pages. Redirects to sign-in when there is no session cookie.
 * Presence is only a convenience check: the backend decides whether the token
 * is still valid, and `adminFetch` redirects on its 401.
 */
export async function requireSuperAdmin(): Promise<void> {
  if (!(await readSuperToken())) redirect("/admin/login");
}
