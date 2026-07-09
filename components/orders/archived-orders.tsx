"use client";

import type { BusinessType, Order } from "@/lib/api/types";
import { OrderRow } from "./order-row";
import { OrderRemoveButton } from "./order-remove-button";

/**
 * The Removed-orders view. Lists orders the merchant took off their board, each
 * with a Restore control. Reuses the standard OrderRow so a removed order reads
 * exactly like a live one, just with a restore affordance beneath it.
 */
export function ArchivedOrders({
  orders,
  businessType,
}: {
  orders: Order[];
  businessType?: BusinessType | null;
}) {
  if (orders.length === 0) {
    return (
      <div className="border-border/70 bg-card/60 rounded-2xl border border-dashed py-14 text-center">
        <p className="text-foreground text-base font-bold tracking-tight">
          Nothing removed.
        </p>
        <p className="text-muted-foreground mx-auto mt-1 max-w-xs text-sm">
          Orders you remove from your board land here, and you can restore any
          of them.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {orders.map((order) => (
        <div key={order.id} className="flex flex-col gap-2">
          <OrderRow order={order} businessType={businessType} />
          <div className="flex justify-end">
            <OrderRemoveButton orderId={order.id} archived />
          </div>
        </div>
      ))}
    </div>
  );
}
