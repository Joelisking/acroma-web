import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { getCurrentBusiness } from "@/lib/api/business";
import { redirectStaffHome } from "@/lib/api/owner-only";
import { HOME_COOKIE } from "@/lib/home-preference";
import { HomePreferenceToggle } from "@/components/dashboard/home-preference-toggle";
import { getPayoutAccount } from "@/lib/api/payments";
import {
  getDashboardActivity,
  getDashboardStats,
} from "@/lib/api/dashboard";
import { DashboardStatsSection } from "@/components/dashboard/dashboard-stats";
import { SetupCallout } from "@/components/dashboard/setup-callout";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { PayoutNudgeBanner } from "@/components/payments/payout-nudge-banner";
import { buildActivity, selectHomeConversations } from "@/lib/dashboard-metrics";
import { DEFAULT_DASHBOARD_FILTER } from "@/lib/dashboard-filter";
import { NeedsYouHero, CaughtUpHero } from "@/components/dashboard/needs-you-hero";
import { AcromaHandlingList } from "@/components/dashboard/acroma-handling-list";
import type { DashboardActivity, DashboardStats } from "@/lib/api/types";

export const metadata: Metadata = { title: "Today · Acroma" };

const ACTIVITY_LIMIT = 6;

const EMPTY_STATS: DashboardStats = {
  range: { start: "", end: "", label: "Today" },
  metrics: {
    conversations: 0,
    orders: 0,
    revenue: 0,
    revenueByMethod: { paystack: 0, cash: 0 },
    noShowCount: 0,
    noShowRate: 0,
  },
};

const EMPTY_ACTIVITY: DashboardActivity = { conversations: [], orders: [] };

export default async function OverviewPage() {
  // Today is owner-only: it shows revenue, conversation counts and the
  // WhatsApp/payout setup callouts, which link to pages a worker cannot open.
  // The staff home is the orders board.
  await redirectStaffHome();

  // Honour the merchant's chosen home surface. A cold launch or post-login
  // entry to /dashboard has no in-app referer, so it routes to Orders when
  // that's home; clicking the Today tab carries a /dashboard referer and stays.
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const homeSurface = cookieStore.get(HOME_COOKIE)?.value;
  const referer = headerStore.get("referer") ?? "";
  if (homeSurface === "orders" && !referer.includes("/dashboard")) {
    redirect("/dashboard/orders");
  }

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

  const { needsYou, handling } = selectHomeConversations(activity.conversations);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:gap-8">
      <div className="flex items-start justify-between gap-3">
        <Greeting name={business.name} />
        <HomePreferenceToggle
          surface="today"
          isHome={homeSurface !== "orders"}
          className="mt-1 shrink-0"
        />
      </div>

      {needsYou ? <NeedsYouHero conversation={needsYou} /> : <CaughtUpHero />}

      {!business.whatsappWebhookActive ? <SetupCallout /> : null}

      {!payout?.paystackSubaccountCode ? <PayoutNudgeBanner /> : null}

      <DashboardStatsSection
        initialFilter={initialFilter}
        initialStats={stats}
        currency={business.currency}
        businessType={business.businessType}
      />

      <AcromaHandlingList conversations={handling} />

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

function Greeting({ name }: { name: string }) {
  const hour = new Date().getHours();
  const part =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return (
    <div>
      <p className="text-muted-foreground text-sm font-medium">{part},</p>
      <h1 className="text-foreground mt-0.5 text-2xl font-semibold tracking-tight sm:text-3xl">
        {name}
      </h1>
    </div>
  );
}
