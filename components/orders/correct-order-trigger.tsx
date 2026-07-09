"use client";

import * as React from "react";
import { Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Business, Order, OrderStatus, Product } from "@/lib/api/types";
import { OrderEditor } from "./order-editor";

type Props = {
  order: Order;
  business: Business;
  products: Product[];
};

// Orders that have been paid for — a "correction" charges only the difference
// against what was collected. Mirrors the backend PAID_STATUSES gate.
const CORRECTABLE: OrderStatus[] = [
  "PAID",
  "PROCESSING",
  "PREPARING",
  "READY_FOR_PICKUP",
  "SHIPPED",
  "DELIVERED",
];

/**
 * "Correct order" action for a PAID order: fix a mispriced/mis-billed line and
 * collect just the difference (or flag a refund). Unpaid orders use
 * {@link EditOrderTrigger} instead.
 */
export function CorrectOrderTrigger({ order, business, products }: Props) {
  const [open, setOpen] = React.useState(false);
  if (!CORRECTABLE.includes(order.status)) return null;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Wrench className="size-4" /> Correct order
      </Button>
      <OrderEditor
        mode="correct"
        open={open}
        onOpenChange={setOpen}
        business={business}
        products={products}
        order={order}
      />
    </>
  );
}
