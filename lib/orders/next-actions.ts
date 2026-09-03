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
  type LucideIcon,
} from "lucide-react";
import type {
  BusinessType,
  OrderFulfillment,
  OrderSource,
  OrderStatus,
  PaymentMethod,
} from "@/lib/api/types";
import { getVocabulary } from "@/lib/vocabulary";

export type OrderAction = {
  status: OrderStatus;
  label: string;
  Icon: LucideIcon;
  variant?: "default" | "outline" | "destructive";
  /** Opens the "record payment" dialog instead of a plain status flip. */
  pay?: boolean;
};

/**
 * Returns the contextually-relevant next-status actions for an order, ordered
 * with the single most likely next step first.
 *
 * Branches on payment method: COD follows a physical fulfilment flow; MOMO
 * follows a payment-first flow. Fulfilment branches the physical flow — a
 * pickup order becomes "ready for pickup" then "picked up" and never goes "out
 * for delivery". Food merchants (FOOD_BEVERAGES) get a PREPARING (cooking) step
 * instead of generic PROCESSING, and the SHIPPED verb reads "out for delivery".
 *
 * This is a UI-only gate; the API accepts these states for any merchant.
 * Pure — no React, no side effects — so both the inline board action and the
 * order-detail control can share one source of truth.
 */
export function nextActions(
  status: OrderStatus,
  paymentMethod: PaymentMethod,
  businessType?: BusinessType | null,
  fulfillment?: OrderFulfillment | null,
  source?: OrderSource | null,
): OrderAction[] {
  const vocab = getVocabulary(businessType);
  const isFood = businessType === "FOOD_BEVERAGES";
  const isPickup = fulfillment === "PICKUP";

  const cancelAction: OrderAction = {
    status: "CANCELLED",
    label: "Cancel",
    Icon: XCircle,
    variant: "destructive",
  };
  const shippedAction: OrderAction = {
    status: "SHIPPED",
    label: vocab.markShippedLabel,
    Icon: Truck,
  };
  const preparingAction: OrderAction = {
    status: "PREPARING",
    label: "Start preparing",
    Icon: ChefHat,
  };
  const readyAction: OrderAction = {
    status: "READY_FOR_PICKUP",
    label: "Mark ready for pickup",
    Icon: Bell,
  };
  const deliveredAction: OrderAction = {
    status: "DELIVERED",
    label: "Mark as delivered",
    Icon: PackageCheck,
  };
  const pickedUpAction: OrderAction = {
    status: "DELIVERED",
    label: "Mark as picked up",
    Icon: PackageCheck,
  };
  const cashReceivedAction: OrderAction = {
    status: "PAID",
    label: "Mark cash received",
    Icon: CheckCircle2,
  };

  // The final fulfilment step and the in-progress options leading to it.
  const fulfilAction = isPickup ? pickedUpAction : deliveredAction;
  const progressActions: OrderAction[] = isPickup
    ? [readyAction]
    : [shippedAction];

  if (businessType === "SERVICES") {
    const noShowAction: OrderAction = {
      status: "NO_SHOW",
      label: "No-show",
      Icon: UserX,
      variant: "outline",
    };
    switch (status) {
      case "PENDING":
        return [
          {
            status: "PROCESSING",
            label: "Confirm booking",
            Icon: CalendarCheck,
          },
          noShowAction,
          cancelAction,
        ];
      case "PROCESSING":
        return [
          {
            status: "PAID",
            label: "Showed up & paid",
            Icon: CheckCircle2,
            pay: true,
          },
          {
            status: "DELIVERED",
            label: "Showed up, pay later",
            Icon: PackageCheck,
            variant: "outline",
          },
          noShowAction,
        ];
      case "DELIVERED":
        return [
          { status: "PAID", label: "Mark as paid", Icon: CheckCircle2, pay: true },
        ];
      default:
        return [];
    }
  }

  // A till cash sale is collected at the counter and created already PAID, so
  // the money question is settled before this table is ever consulted. What is
  // left is the same fulfilment ladder a paid MoMo order walks, which is why a
  // till order skips the cash-on-delivery branch whatever it was paid with.
  // Mirrors TILL_TRANSITIONS in the backend's orders.service.ts.
  if (paymentMethod === "CASH_ON_DELIVERY" && source !== "TILL") {
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
                } satisfies OrderAction,
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
              } satisfies OrderAction,
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

/**
 * Split the action list into the one dominant next step and the rest. The
 * primary is the first non-destructive action (the natural forward move);
 * destructive and alternative actions fall to `secondary`. Used to make the
 * primary action visually dominant on both the board and the detail page.
 */
export function splitOrderActions(actions: OrderAction[]): {
  primary: OrderAction | null;
  secondary: OrderAction[];
} {
  const primaryIndex = actions.findIndex((a) => a.variant !== "destructive");
  if (primaryIndex === -1) return { primary: null, secondary: actions };
  return {
    primary: actions[primaryIndex],
    secondary: actions.filter((_, i) => i !== primaryIndex),
  };
}
