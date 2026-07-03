import "server-only";

import { apiFetch } from "./server";
import { productRevenueReportSchema } from "./analytics-schema";
import { analyticsFilterToQuery } from "@/lib/dashboard-filter";
import type { AnalyticsFilter, ProductRevenueReport } from "./types";

export async function getProductRevenue(
  filter: AnalyticsFilter,
): Promise<ProductRevenueReport> {
  const raw = await apiFetch<unknown>(
    `/dashboard/product-revenue?${analyticsFilterToQuery(filter)}`,
  );
  return productRevenueReportSchema.parse(raw) as ProductRevenueReport;
}
