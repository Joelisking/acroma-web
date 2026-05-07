import type { Metadata } from "next";
import { MessageSquare, ShoppingBag, Wallet } from "lucide-react";

import { getCurrentBusiness } from "@/lib/api/business";
import { listConversations } from "@/lib/api/conversations";
import { listOrders } from "@/lib/api/orders";
import { StatCard } from "@/components/dashboard/stat-card";
import { SetupCallout } from "@/components/dashboard/setup-callout";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { formatMoney } from "@/lib/format";
import {
  buildActivity,
  computeTodayMetrics,
  startOfTodayUtc,
} from "@/lib/dashboard-metrics";

export const metadata: Metadata = { title: "Overview · Acroma" };

const ACTIVITY_LIMIT = 6;

export default async function OverviewPage() {
  const [business, conversations, orders] = await Promise.all([
    getCurrentBusiness(),
    safeList(listConversations()),
    safeList(listOrders()),
  ]);
  // Layout already enforces auth, but TS doesn't know that.
  if (!business) return null;

  const today = computeTodayMetrics(conversations, orders, startOfTodayUtc());
  const activity = buildActivity(conversations, orders).slice(
    0,
    ACTIVITY_LIMIT,
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:gap-8">
      <MobileGreeting name={business.name} />

      {!business.whatsappWebhookActive ? <SetupCallout /> : null}

      <section
        className="grid gap-4 sm:grid-cols-3"
        aria-label="Today's metrics"
      >
        <StatCard
          label="Conversations"
          value={String(today.conversations)}
          hint="Today"
          icon={MessageSquare}
          tone="orange"
        />
        <StatCard
          label="Orders"
          value={String(today.orders)}
          hint="Today"
          icon={ShoppingBag}
          tone="blue"
        />
        <StatCard
          label="Revenue"
          value={formatMoney(today.revenue, business.currency)}
          hint="Today"
          icon={Wallet}
          tone="green"
        />
      </section>

      <RecentActivity items={activity} />
    </div>
  );
}

async function safeList<T>(p: Promise<T[]>): Promise<T[]> {
  try {
    return await p;
  } catch {
    return [];
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
