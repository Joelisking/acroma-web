"use client";

import { MessageSquare, ShoppingBag, Wallet } from "lucide-react";
import { StatCard } from "./stat-card";
import { DashboardFilterBar } from "./dashboard-filter-bar";
import { useDashboardStats } from "./use-dashboard-stats";
import { changeLabel } from "@/lib/dashboard-filter";
import { formatMoney } from "@/lib/format";
import type { DashboardFilter, DashboardStats } from "@/lib/api/types";

type Props = {
  initialFilter: DashboardFilter;
  initialStats: DashboardStats;
  currency: string;
};

export function DashboardStatsSection({
  initialFilter,
  initialStats,
  currency,
}: Props) {
  const {
    filter,
    stats,
    error,
    isPending,
    isSaving,
    isDefault,
    applyFilter,
    saveDefault,
  } = useDashboardStats(initialFilter, initialStats);

  const { metrics, range, previous } = stats;
  const change = previous?.change;

  return (
    <section className="flex flex-col gap-4" aria-label="Business metrics">
      <DashboardFilterBar
        filter={filter}
        onChange={applyFilter}
        onSaveDefault={saveDefault}
        saving={isSaving}
        isDefault={isDefault}
      />

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Conversations"
          value={String(metrics.conversations)}
          hint={range.label}
          icon={MessageSquare}
          tone="orange"
          loading={isPending}
          delta={
            change
              ? { change: change.conversations, label: changeLabel(change.conversations) }
              : undefined
          }
        />
        <StatCard
          label="Orders"
          value={String(metrics.orders)}
          hint={range.label}
          icon={ShoppingBag}
          tone="blue"
          loading={isPending}
          delta={
            change
              ? { change: change.orders, label: changeLabel(change.orders) }
              : undefined
          }
        />
        <StatCard
          label="Revenue"
          value={formatMoney(metrics.revenue, currency)}
          hint={range.label}
          icon={Wallet}
          tone="green"
          loading={isPending}
          delta={
            change
              ? { change: change.revenue, label: changeLabel(change.revenue) }
              : undefined
          }
        />
      </div>
    </section>
  );
}
