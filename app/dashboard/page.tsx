import type { Metadata } from "next";

import { getCurrentBusiness } from "@/lib/api/business";
import { getPayoutAccount } from "@/lib/api/payments";
import {
  getDashboardActivity,
  getDashboardStats,
} from "@/lib/api/dashboard";
import { DashboardStatsSection } from "@/components/dashboard/dashboard-stats";
import { SetupCallout } from "@/components/dashboard/setup-callout";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { PayoutNudgeBanner } from "@/components/payments/payout-nudge-banner";
import { buildActivity } from "@/lib/dashboard-metrics";
import { DEFAULT_DASHBOARD_FILTER } from "@/lib/dashboard-filter";
import type { DashboardActivity, DashboardStats } from "@/lib/api/types";

export const metadata: Metadata = { title: "Overview · Acroma" };

const ACTIVITY_LIMIT = 6;

const EMPTY_STATS: DashboardStats = {
  range: { start: "", end: "", label: "Today" },
  metrics: { conversations: 0, orders: 0, revenue: 0 },
};

const EMPTY_ACTIVITY: DashboardActivity = { conversations: [], orders: [] };

export default async function OverviewPage() {
  const business = await getCurrentBusiness();
  // Layout already enforces auth, but TS doesn't know that.
  if (!business) return null;

  const initialFilter =
    business.dashboardDefaultFilter ?? DEFAULT_DASHBOARD_FILTER;

  const [stats, activity, payout] = await Promise.all([
    safe(getDashboardStats(initialFilter), EMPTY_STATS),
    safe(getDashboardActivity(ACTIVITY_LIMIT), EMPTY_ACTIVITY),
    safe(getPayoutAccount(), null),
  ]);

  const activityItems = buildActivity(
    activity.conversations,
    activity.orders,
  ).slice(0, ACTIVITY_LIMIT);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:gap-8">
      <MobileGreeting name={business.name} />

      {!business.whatsappWebhookActive ? <SetupCallout /> : null}

      {!payout?.paystackSubaccountCode ? <PayoutNudgeBanner /> : null}

      <DashboardStatsSection
        initialFilter={initialFilter}
        initialStats={stats}
        currency={business.currency}
      />

      <RecentActivity items={activityItems} />
    </div>
  );
}

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

function MobileGreeting({ name }: { name: string }) {
  return (
    <div className="lg:hidden">
      <p className="eyebrow text-muted-foreground">Welcome back</p>
      <h1 className="font-display text-foreground mt-1 text-3xl font-medium tracking-tight">
        {name}
      </h1>
    </div>
  );
}
