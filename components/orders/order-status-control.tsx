"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Bell,
  CalendarCheck,
  CheckCircle2,
  ChefHat,
  Cog,
  PackageCheck,
  Truck,
  UserX,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkPaidDialog } from "@/components/orders/mark-paid-dialog";
import {
  markOrdersPaidAction,
  updateOrderStatusAction,
} from "@/lib/api/orders-actions";
import type {
  BusinessType,
  OrderFulfillment,
  OrderStatus,
  PaymentMethod,
} from "@/lib/api/types";
import { getVocabulary } from "@/lib/vocabulary";

type Action = {
  status: OrderStatus;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "outline" | "destructive";
  pay?: boolean;
};

/**
 * Returns the contextually-relevant next-status actions for an order.
 *
 * Branches on payment method: COD follows a physical fulfilment flow;
 * MOMO follows a payment-first flow.
 *
 * Fulfilment branches the physical flow. A pickup order is made
 * "ready for pickup" then "picked up" — it never goes "out for
 * delivery", and its terminal button reads "Mark as picked up". A
 * delivery order keeps the SHIPPED → DELIVERED path.
 *
 * Food vertical (businessType === FOOD_BEVERAGES) gets PREPARING
 * (cooking) instead of generic PROCESSING. Vocabulary swap: the SHIPPED
 * button reads "Mark out for delivery" for food merchants. This is a
 * UI-only gate; the API accepts these states for any merchant who calls
 * it directly.
 */
function nextActions(
  status: OrderStatus,
  paymentMethod: PaymentMethod,
  businessType?: BusinessType | null,
  fulfillment?: OrderFulfillment | null,
): Action[] {
  const vocab = getVocabulary(businessType);
  const isFood = businessType === "FOOD_BEVERAGES";
  const isPickup = fulfillment === "PICKUP";
  const cancelAction: Action = {
    status: "CANCELLED",
    label: "Cancel",
    Icon: XCircle,
    variant: "destructive",
  };
  const shippedAction: Action = {
    status: "SHIPPED",
    label: vocab.markShippedLabel,
    Icon: Truck,
  };
  const preparingAction: Action = {
    status: "PREPARING",
    label: "Start preparing",
    Icon: ChefHat,
  };
  const readyAction: Action = {
    status: "READY_FOR_PICKUP",
    label: "Mark ready for pickup",
    Icon: Bell,
  };
  const deliveredAction: Action = {
    status: "DELIVERED",
    label: "Mark as delivered",
    Icon: PackageCheck,
  };
  const pickedUpAction: Action = {
    status: "DELIVERED",
    label: "Mark as picked up",
    Icon: PackageCheck,
  };
  const cashReceivedAction: Action = {
    status: "PAID",
    label: "Mark cash received",
    Icon: CheckCircle2,
  };

  // The final fulfilment step and the in-progress options that lead to it.
  // Pickup: "ready for pickup" → "picked up". Delivery: "out for delivery"
  // → "delivered". A delivery order never shows "ready for pickup" (that is a
  // pickup-only concept); for food the PREPARING step already covers "being
  // prepared". Shipping is delivery-only.
  const fulfilAction = isPickup ? pickedUpAction : deliveredAction;
  const progressActions: Action[] = isPickup ? [readyAction] : [shippedAction];

  if (businessType === "SERVICES") {
    const noShowAction: Action = {
      status: "NO_SHOW",
      label: "No-show",
      Icon: UserX,
      variant: "outline",
    };
    switch (status) {
      case "PENDING":
        return [
          { status: "PROCESSING", label: "Confirm booking", Icon: CalendarCheck },
          noShowAction,
          cancelAction,
        ];
      case "PROCESSING":
        return [
          { status: "PAID", label: "Showed up & paid", Icon: CheckCircle2, pay: true },
          { status: "DELIVERED", label: "Showed up, pay later", Icon: PackageCheck, variant: "outline" },
          noShowAction,
        ];
      case "DELIVERED":
        return [{ status: "PAID", label: "Mark as paid", Icon: CheckCircle2, pay: true }];
      default:
        return [];
    }
  }

  if (paymentMethod === "CASH_ON_DELIVERY") {
    switch (status) {
      case "PENDING":
        return [
          ...(isFood
            ? [preparingAction]
            : [
              {
                status: "PROCESSING",
                label: "Start processing",
                Icon: Cog,
              } satisfies Action,
            ]),
          cancelAction,
        ];
      case "PROCESSING":
        return [
          ...(isFood ? [preparingAction] : []),
          ...progressActions,
          cancelAction,
        ];
      case "PREPARING":
        return [...progressActions, cancelAction];
      case "READY_FOR_PICKUP":
        return [fulfilAction, cancelAction];
      case "SHIPPED":
        return [deliveredAction, cancelAction];
      case "DELIVERED":
        return [cashReceivedAction];
      default:
        return [];
    }
  }

  // MOMO path
  switch (status) {
    case "PENDING":
    case "PAYMENT_PENDING":
      return [
        { status: "PAID", label: "Mark as paid", Icon: CheckCircle2 },
        cancelAction,
      ];
    case "PAID":
      return [
        ...(isFood
          ? [preparingAction]
          : [
              {
                status: "PROCESSING",
                label: "Start processing",
                Icon: Cog,
              } satisfies Action,
            ]),
        cancelAction,
      ];
    case "PROCESSING":
      return [...(isFood ? [preparingAction] : []), ...progressActions];
    case "PREPARING":
      return [...progressActions];
    case "READY_FOR_PICKUP":
      return [fulfilAction];
    case "SHIPPED":
      return [deliveredAction];
    default:
      return [];
  }
}

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
  const actions = nextActions(status, paymentMethod, businessType, fulfillment);
  if (actions.length === 0) return null;

  function runStatus(next: OrderStatus, label: string) {
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, next);
      if (!result.ok) toast.error(result.error);
      else toast.success(label);
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

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const { Icon } = action;
          return (
            <Button
              key={action.status + action.label}
              variant={action.variant ?? "default"}
              size="sm"
              disabled={pending}
              onClick={() =>
                action.pay
                  ? setPayOpen(true)
                  : runStatus(action.status, `${action.label} ✓`)
              }
              className="gap-1.5"
            >
              <Icon />
              {action.label}
            </Button>
          );
        })}
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
