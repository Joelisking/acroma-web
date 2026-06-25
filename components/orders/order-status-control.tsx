"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MarkPaidDialog } from "@/components/orders/mark-paid-dialog";
import {
  markOrdersPaidAction,
  updateOrderStatusAction,
} from "@/lib/api/orders-actions";
import {
  nextActions,
  splitOrderActions,
  type OrderAction,
} from "@/lib/orders/next-actions";
import type {
  BusinessType,
  OrderFulfillment,
  OrderStatus,
  PaymentMethod,
} from "@/lib/api/types";

/**
 * The owner's action controls on the order detail page. The contextual next
 * step is rendered as one dominant, touch-sized button; alternative and
 * destructive moves sit quietly beneath it so the obvious action is never lost
 * in a row of equal-weight buttons. Action logic lives in `lib/orders`.
 */
export function OrderStatusControl({
  orderId,
  status,
  paymentMethod,
  businessType,
  fulfillment,
  totalAmount,
  currency,
}: {
  orderId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  businessType?: BusinessType | null;
  fulfillment?: OrderFulfillment | null;
  totalAmount: number;
  currency: string;
}) {
  const [pending, startTransition] = React.useTransition();
  const [payOpen, setPayOpen] = React.useState(false);

  const { primary, secondary } = splitOrderActions(
    nextActions(status, paymentMethod, businessType, fulfillment),
  );
  if (!primary) return null;

  function trigger(action: OrderAction) {
    if (action.pay) {
      setPayOpen(true);
      return;
    }
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, action.status);
      if (!result.ok) toast.error(result.error);
      else toast.success(`${action.label} ✓`);
    });
  }

  function runPaid(amount: number) {
    startTransition(async () => {
      const result = await markOrdersPaidAction([orderId], amount);
      if (!result.ok) toast.error(result.error);
      else {
        toast.success("Marked as paid ✓");
        setPayOpen(false);
      }
    });
  }

  const PrimaryIcon = primary.Icon;
  return (
    <>
      <div className="flex flex-col gap-3">
        <Button
          size="lg"
          disabled={pending}
          onClick={() => trigger(primary)}
          className="h-12 w-full gap-2 text-[0.95rem] font-semibold sm:w-auto sm:self-start sm:px-6"
        >
          <PrimaryIcon className="size-4" strokeWidth={2.25} />
          {primary.label}
        </Button>

        {secondary.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {secondary.map((action) => {
              const { Icon } = action;
              return (
                <Button
                  key={action.status + action.label}
                  variant={
                    action.variant === "destructive" ? "destructive" : "outline"
                  }
                  size="sm"
                  disabled={pending}
                  onClick={() => trigger(action)}
                  className="h-9 gap-1.5"
                >
                  <Icon className="size-3.5" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        ) : null}
      </div>

      <MarkPaidDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        defaultAmount={totalAmount}
        currency={currency}
        pending={pending}
        onConfirm={runPaid}
      />
    </>
  );
}
