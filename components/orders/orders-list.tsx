"use client";

import * as React from "react";
import type { BusinessType, Order } from "@/lib/api/types";
import { OrderRow } from "./order-row";
import { OrdersBulkBar } from "./orders-bulk-bar";

export function OrdersList({
  orders,
  businessType,
}: {
  orders: Order[];
  businessType?: BusinessType | null;
}) {
  const selectable = businessType === "SERVICES";
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clear() {
    setSelected(new Set());
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {orders.map((order) => (
          <OrderRow
            key={order.id}
            order={order}
            businessType={businessType}
            selectable={selectable}
            selected={selected.has(order.id)}
            onToggle={toggle}
          />
        ))}
      </div>
      {selectable ? (
        <OrdersBulkBar selectedIds={Array.from(selected)} onClear={clear} />
      ) : null}
    </>
  );
}
