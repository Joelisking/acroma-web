import "server-only";

import { redirect } from "next/navigation";

import { clearSuperCookie, readSuperToken } from "./cookies";

export class AdminApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

type AdminFetchInit = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  searchParams?: Record<string, string | number | boolean | undefined | null>;
  /**
   * What a 401 does. Pages and actions redirect to the sign-in screen
   * (default). Route handlers answering a browser `fetch` pass "throw" so the
   * caller gets a 401 instead of a redirect to HTML.
   */
  onUnauthorized?: "redirect" | "throw";
};

/**
 * Server-side fetch for `/super-admin/*`. Sends the session token as a Bearer
 * header. A 401 means the session is gone: the cookie is cleared and the user
 * is sent back to sign in.
 */
export async function adminFetch<T>(
  path: string,
  init: AdminFetchInit = {},
): Promise<T> {
  const apiUrl = process.env.ACROMA_API_URL;
  if (!apiUrl) throw new Error("ACROMA_API_URL is not set");

  const token = await readSuperToken();
  if (!token) {
    if (init.onUnauthorized === "throw") throw new AdminApiError(401, "Unauthorized");
    redirect("/admin/login");
  }

  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(init.searchParams ?? {})) {
    if (value !== undefined && value !== null) qs.set(key, String(value));
  }
  const query = qs.size > 0 ? `?${qs.toString()}` : "";

  const headers = new Headers({
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  });
  if (init.body !== undefined) headers.set("Content-Type", "application/json");

  const res = await fetch(`${apiUrl}${path}${query}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });

  if (res.status === 401) {
    await clearSuperCookie();
    if (init.onUnauthorized === "throw") throw new AdminApiError(401, "Unauthorized");
    redirect("/admin/login");
  }

  if (!res.ok) {
    throw new AdminApiError(res.status, await errorMessage(res));
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

async function errorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) return body.message.join("; ");
    if (body.message) return body.message;
  } catch {
    // Non-JSON error body.
  }
  return res.statusText || `Request failed (${res.status})`;
}
