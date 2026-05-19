"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "./server";
import { getDashboardStats } from "./dashboard";
import { listCustomers } from "./customers";
import type { DashboardFilter, DashboardStats } from "./types";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/** Re-fetch stats for a new filter. Called by the dashboard client island. */
export async function getDashboardStatsAction(
  filter: DashboardFilter,
): Promise<ActionResult<DashboardStats>> {
  try {
    const data = await getDashboardStats(filter);
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't load stats") };
  }
}

/** Persist the merchant's default dashboard filter. */
export async function setDefaultDashboardFilterAction(
  filter: DashboardFilter,
): Promise<ActionResult<void>> {
  try {
    // The backend validates the filter from the request BODY.
    await apiFetch(`/settings/dashboard-filter`, {
      method: "PATCH",
      body: filter,
    });
    revalidatePath("/dashboard");
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't save default") };
  }
}

/** Search customers for the customer-scope combobox. */
export async function searchCustomersAction(
  search: string,
): Promise<ActionResult<{ phone: string; name: string | null }[]>> {
  try {
    const customers = await listCustomers(search || undefined);
    return {
      ok: true,
      data: customers.map((c) => ({ phone: c.phone, name: c.name })),
    };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't load customers") };
  }
}

function humanError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
