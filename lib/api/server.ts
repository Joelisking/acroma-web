import "server-only";

import {
  readAccessToken,
  readRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from "./cookies";
import type { ApiErrorBody, RefreshResponse } from "./types";

const API_URL = process.env.ACROMA_API_URL;

if (!API_URL) {
  // Throw at import time on the server so misconfig is caught fast.
  throw new Error("ACROMA_API_URL is not set");
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: ApiErrorBody | string,
  ) {
    super(typeof body === "string" ? body : flattenMessage(body.message));
    this.name = "ApiError";
  }
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Skip auth header. Use for /auth/login, /auth/register, /auth/refresh. */
  auth?: false;
  /** Internal — prevents infinite recursion on refresh. */
  _retried?: boolean;
  /**
   * Internal — overrides the cookie-read access token on the retry leg.
   * Server Components can't persist a refreshed cookie, so we thread the
   * fresh token through memory instead of relying on a re-read.
   */
  _accessOverride?: string;
};

/**
 * Server-side fetch wrapper for the Acroma backend.
 *
 * - Injects the access token from the HTTP-only cookie.
 * - On 401, attempts a single refresh and replays the request.
 * - Throws `ApiError` on non-2xx responses.
 *
 * Use from Server Components, Server Actions, and Route Handlers only.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, auth, headers, _retried, _accessOverride, ...rest } = options;

  const finalHeaders = new Headers(headers);
  finalHeaders.set("Accept", "application/json");
  if (body !== undefined) finalHeaders.set("Content-Type", "application/json");

  if (auth !== false) {
    const token = _accessOverride ?? (await readAccessToken());
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: rest.cache ?? "no-store",
  });

  if (res.status === 401 && auth !== false && !_retried) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return apiFetch<T>(path, {
        ...options,
        _retried: true,
        _accessOverride: refreshed,
      });
    }
  }

  if (!res.ok) {
    const errorBody = await safeJson(res);
    throw new ApiError(res.status, errorBody ?? res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/**
 * Exchange the refresh cookie for a fresh access token.
 *
 * Returns the new access token on success (and persists it via cookies when
 * the calling context allows it — Server Actions, Route Handlers, the proxy).
 * Returns null on failure and clears stale cookies. Server Component callers
 * should thread the returned token through `_accessOverride` since cookie
 * writes silently no-op there.
 */
export async function tryRefresh(): Promise<string | null> {
  const refreshToken = await readRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });

  if (!res.ok) {
    await clearAuthCookies();
    return null;
  }

  const { accessToken } = (await res.json()) as RefreshResponse;
  await setAuthCookies({ accessToken });
  return accessToken;
}

async function safeJson(res: Response): Promise<ApiErrorBody | null> {
  try {
    return (await res.json()) as ApiErrorBody;
  } catch {
    return null;
  }
}

function flattenMessage(message: string | string[]): string {
  return Array.isArray(message) ? message.join("; ") : message;
}
