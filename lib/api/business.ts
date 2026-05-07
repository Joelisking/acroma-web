import "server-only";

import { apiFetch, ApiError } from "./server";
import type { Business } from "./types";

/**
 * Fetch the currently authenticated business profile.
 * Returns null if unauthenticated or token is invalid.
 */
export async function getCurrentBusiness(): Promise<Business | null> {
  try {
    return await apiFetch<Business>("/business/me");
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}
