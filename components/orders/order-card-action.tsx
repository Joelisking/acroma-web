"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MarkPaidDialog } from "./mark-paid-dialog";
import {
  markOrdersPaidAction,
  updateOrderStatusAction,
} from "@/lib/api/orders-actions";
import { nextActions, splitOrderActions } from "@/lib/orders/next-actions";
import type { BusinessType, Order } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * The single most important next step for an order, rendered as a prominent
 * button right on its board card so the merchant can advance it in one tap
 * without opening the detail page. Sits above the card's stretched link
 * (relative z-10) and stops click propagation so it never triggers navigation.
 *
 * Renders nothing when an order has no forward action (e.g. delivered, closed).
 */
export function OrderCardAction({
  order,
  businessType,
  className,
}: {
  order: Order;
  businessType?: BusinessType | null;
  className?: string;
}) {
  const [pending, startTransition] = React.useTransition();
  const [payOpen, setPayOpen] = React.useState(false);

  const { primary } = splitOrderActions(
    nextActions(order.status, order.paymentMethod, businessType, order.fulfillment),
  );
  if (!primary) return null;

  function runStatus(next: typeof primary) {
    if (!next) return;
    startTransition(async () => {
      const result = await updateOrderStatusAction(order.id, next.status);
      if (!result.ok) toast.error(result.error);
      else toast.success(`${next.label} ✓`);
    });
  }

  function runPaid(amount: number) {
    startTransition(async () => {
      const result = await markOrdersPaidAction([order.id], amount);
      if (!result.ok) toast.error(result.error);
      else {
        toast.success("Marked as paid ✓");
        setPayOpen(false);
      }
    });
  }

  const { Icon } = primary;
  return (
    <div className={cn("relative z-10", className)}>
      <Button
        size="lg"
        disabled={pending}
        onClick={(e) => {
          e.stopPropagation();
          if (primary.pay) setPayOpen(true);
          else runStatus(primary);
        }}
        className="h-11 w-full gap-2 text-[0.9rem] font-semibold"
      >
        <Icon className="size-4" strokeWidth={2.25} />
        {primary.label}
      </Button>
      <MarkPaidDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        defaultAmount={order.totalAmount}
        currency={order.currency}
        pending={pending}
        onConfirm={runPaid}
      />
    </div>
  );
}
