import type { DashboardFilter, DashboardRange } from "@/lib/api/types";

/** The fallback filter when a merchant has no saved default. */
export const DEFAULT_DASHBOARD_FILTER: DashboardFilter = { range: "TODAY" };

/** Presets shown in the range selector, in display order. */
export const RANGE_OPTIONS: { value: DashboardRange; label: string }[] = [
  { value: "TODAY", label: "Today" },
  { value: "YESTERDAY", label: "Yesterday" },
  { value: "THIS_WEEK", label: "This week" },
  { value: "THIS_MONTH", label: "This month" },
  { value: "LAST_7_DAYS", label: "Last 7 days" },
  { value: "LAST_30_DAYS", label: "Last 30 days" },
  { value: "LAST_90_DAYS", label: "Last 90 days" },
  { value: "THIS_YEAR", label: "This year" },
  { value: "LIFETIME", label: "Lifetime" },
  { value: "CUSTOM", label: "Custom range" },
];

/** LIFETIME has no prior window, so comparison is disabled for it. */
export function canCompare(filter: DashboardFilter): boolean {
  return filter.range !== "LIFETIME";
}

/** What each range's "previous period" actually is, for the Compare tooltip. */
const COMPARE_TARGETS: Record<DashboardRange, string> = {
  TODAY: "yesterday",
  YESTERDAY: "the day before",
  THIS_WEEK: "last week",
  THIS_MONTH: "last month",
  LAST_7_DAYS: "the previous 7 days",
  LAST_30_DAYS: "the previous 30 days",
  LAST_90_DAYS: "the previous 90 days",
  THIS_YEAR: "last year",
  LIFETIME: "",
  CUSTOM: "the equal-length period right before it",
};

/** Tooltip copy explaining what the Compare toggle measures against. */
export function compareHint(filter: DashboardFilter): string {
  if (!canCompare(filter)) {
    return "Comparison isn't available for Lifetime, there's no earlier period to measure against.";
  }
  return `Shows each metric's change vs ${COMPARE_TARGETS[filter.range]}.`;
}

/** Builds the query string for GET /dashboard/stats from a filter. */
export function filterToQuery(filter: DashboardFilter): string {
  const params = new URLSearchParams();
  params.set("range", filter.range);
  if (filter.startDate) params.set("startDate", filter.startDate);
  if (filter.endDate) params.set("endDate", filter.endDate);
  if (filter.orderStatus) params.set("orderStatus", filter.orderStatus);
  if (filter.conversationStatus)
    params.set("conversationStatus", filter.conversationStatus);
  if (filter.customerSegment)
    params.set("customerSegment", filter.customerSegment);
  if (filter.customerPhone) params.set("customerPhone", filter.customerPhone);
  if (filter.compare && canCompare(filter)) params.set("compare", "true");
  return params.toString();
}

/** Human label for a compare delta, e.g. "+12% vs previous period". */
export function changeLabel(change: number | null): string {
  if (change === null) return "no prior data";
  const sign = change > 0 ? "+" : "";
  return `${sign}${change}% vs previous period`;
}
