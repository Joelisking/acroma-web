import type { Metadata } from "next";

import { getCurrentBusiness } from "@/lib/api/business";
import { getProductRevenue } from "@/lib/api/analytics";
import { AnalyticsView } from "@/components/analytics/analytics-view";
import type { AnalyticsFilter, ProductRevenueReport } from "@/lib/api/types";

export const metadata: Metadata = { title: "Analytics · Acroma" };

const INITIAL_FILTER: AnalyticsFilter = { range: "LAST_24_HOURS" };

const EMPTY_REPORT: ProductRevenueReport = {
  range: { start: "", end: "", label: "Last 24 hours" },
  currency: "GHS",
  totalRevenue: 0,
  bucket: "hour",
  products: [],
  seriesKeys: [],
  series: [],
};

export default async function AnalyticsPage() {
  const business = await getCurrentBusiness();
  if (!business) return null;

  let report: ProductRevenueReport;
  try {
    report = await getProductRevenue(INITIAL_FILTER);
  } catch {
    report = { ...EMPTY_REPORT, currency: business.currency };
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
        Analytics
      </h1>
      <AnalyticsView initialFilter={INITIAL_FILTER} initialReport={report} />
    </div>
  );
}
