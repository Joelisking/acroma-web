"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import type { BusinessType, Order } from "@/lib/api/types";
import { groupOrdersIntoLanes, type LaneTone } from "@/lib/orders/lanes";
import { OrderRow } from "./order-row";
import { OrdersEmpty } from "./orders-empty";
import { SegmentedControl } from "@/components/shared/segmented-control";
import { cn } from "@/lib/utils";

const TONE_DOT: Record<LaneTone, string> = {
  attention: "bg-brand-orange",
  active: "bg-brand-blue",
  ready: "bg-brand-green",
  muted: "bg-muted-foreground/40",
};

/**
 * The orders operating board. Groups every order into operational lanes
 * (needs-your-move → in progress → ready → completed/closed) so the owner can
 * scan the state of service at a glance. Defaults to a focused "Live" view that
 * folds away completed/closed work; "All" reveals the full history.
 *
 * Each card carries its own one-tap next action (OrderCardAction), so the board
 * doubles as the action surface during a rush, not just a read-only list.
 */
export function OrdersBoard({
  orders,
  businessType,
  isOwner = true,
}: {
  orders: Order[];
  businessType?: BusinessType | null;
  isOwner?: boolean;
}) {
  const [showAll, setShowAll] = React.useState(false);

  if (orders.length === 0) return <OrdersEmpty />;

  const lanes = groupOrdersIntoLanes(orders);
  const liveCount = lanes
    .filter((g) => !g.lane.terminal)
    .reduce((n, g) => n + g.orders.length, 0);
  const doneCount = lanes
    .filter((g) => g.lane.terminal)
    .reduce((n, g) => n + g.orders.length, 0);

  const visible = lanes.filter(
    (g) => g.orders.length > 0 && (showAll || !g.lane.terminal),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <SegmentedControl
          aria-label="Order view"
          value={showAll ? "all" : "live"}
          onValueChange={(v) => setShowAll(v === "all")}
          segments={[
            { value: "live", label: "Live" },
            { value: "all", label: "All" },
          ]}
        />
        <p className="text-muted-foreground text-sm tabular-nums">
          {liveCount} active{doneCount > 0 ? ` · ${doneCount} closed` : ""}
        </p>
      </div>

      {liveCount === 0 && !showAll ? (
        <div className="border-border/70 bg-card/60 rounded-2xl border border-dashed py-14 text-center">
          <p className="text-foreground text-base font-bold tracking-tight">
            Nothing live right now.
          </p>
          <p className="text-muted-foreground mx-auto mt-1 max-w-xs text-sm">
            Every order is wrapped up. New orders land here the moment Acroma
            confirms them.
          </p>
        </div>
      ) : null}

      {visible.map(({ lane, orders: laneOrders }) => (
        <section key={lane.id} aria-label={lane.label}>
          <div className="mb-3 flex items-center gap-2">
            <span
              className={cn("size-2 rounded-full", TONE_DOT[lane.tone])}
              aria-hidden
            />
            <h2 className="text-foreground text-sm font-bold tracking-tight">
              {lane.label}
            </h2>
            <span className="text-muted-foreground bg-muted rounded-full px-2 py-0.5 text-xs font-medium tabular-nums">
              {laneOrders.length}
            </span>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {laneOrders.map((order) => (
              <OrderRow
                isOwner={isOwner}
                key={order.id}
                order={order}
                businessType={businessType}
              />
            ))}
          </div>
        </section>
      ))}

      {!showAll && doneCount > 0 ? (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1.5 self-center rounded-full px-4 py-2 text-sm font-medium transition-colors"
        >
          <ChevronDown className="size-4" />
          Show {doneCount} completed &amp; closed
        </button>
      ) : null}
    </div>
  );
}
