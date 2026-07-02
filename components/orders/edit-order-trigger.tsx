"use client";

import * as React from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Business, Order, Product } from "@/lib/api/types";
import { OrderEditor } from "./order-editor";

type Props = {
  order: Order;
  business: Business;
  products: Product[];
};

/**
 * "Edit order" action for the order detail page. Only shown while the order
 * is still unpaid (PENDING / PAYMENT_PENDING) — a paid order's items are not
 * editable through this flow.
 */
export function EditOrderTrigger({ order, business, products }: Props) {
  const [open, setOpen] = React.useState(false);
  const editable = order.status === "PENDING" || order.status === "PAYMENT_PENDING";
  if (!editable) return null;

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="size-4" /> Edit order
      </Button>
      <OrderEditor
        mode="edit"
        open={open}
        onOpenChange={setOpen}
        business={business}
        products={products}
        order={order}
      />
    </>
  );
}
