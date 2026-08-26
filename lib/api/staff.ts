import "server-only";

import { apiFetch } from "./server";
import type { Staff } from "./types";

/** Owner-only. The backend scopes the list to the calling business. */
export async function listStaff(): Promise<Staff[]> {
  return apiFetch<Staff[]>("/staff");
}
