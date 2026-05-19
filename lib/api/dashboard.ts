import "server-only";

import { apiFetch } from "./server";
import type {
  DashboardActivity,
  DashboardFilter,
  DashboardStats,
} from "./types";
import { filterToQuery } from "@/lib/dashboard-filter";

export async function getDashboardStats(
  filter: DashboardFilter,
): Promise<DashboardStats> {
  return apiFetch<DashboardStats>(`/dashboard/stats?${filterToQuery(filter)}`);
}

export async function getDashboardActivity(
  limit = 6,
): Promise<DashboardActivity> {
  return apiFetch<DashboardActivity>(`/dashboard/activity?limit=${limit}`);
}
