"use client";

import * as React from "react";
import { toast } from "sonner";
import { CheckCircle2, Cog, Truck, PackageCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateOrderStatusAction } from "@/lib/api/orders-actions";
import type { OrderStatus, PaymentMethod } from "@/lib/api/types";

type Action = {
  status: OrderStatus;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "outline" | "destructive";
};

/**
 * Returns the contextually-relevant next-status actions for an order.
 * Branches on payment method: COD follows a physical fulfilment flow;
 * MOMO follows a payment-first flow.
 */
function nextActions(
  status: OrderStatus,
  paymentMethod: PaymentMethod,
): Action[] {
  if (paymentMethod === "CASH_ON_DELIVERY") {
    switch (status) {
      case "PENDING":
        return [
          { status: "PROCESSING", label: "Start processing", Icon: Cog },
          {
            status: "CANCELLED",
            label: "Cancel",
            Icon: XCircle,
            variant: "destructive",
          },
        ];
      case "PROCESSING":
        return [
          { status: "SHIPPED", label: "Mark as shipped", Icon: Truck },
          {
            status: "CANCELLED",
            label: "Cancel",
            Icon: XCircle,
            variant: "destructive",
          },
        ];
      case "SHIPPED":
        return [
          {
            status: "DELIVERED",
            label: "Mark as delivered",
            Icon: PackageCheck,
          },
          {
            status: "CANCELLED",
            label: "Cancel",
            Icon: XCircle,
            variant: "destructive",
          },
        ];
      case "DELIVERED":
        return [
          { status: "PAID", label: "Mark cash received", Icon: CheckCircle2 },
        ];
      default:
        return [];
    }
  }

  // MOMO path (existing)
  switch (status) {
    case "PENDING":
    case "PAYMENT_PENDING":
      return [
        { status: "PAID", label: "Mark as paid", Icon: CheckCircle2 },
        {
          status: "CANCELLED",
          label: "Cancel",
          Icon: XCircle,
          variant: "destructive",
        },
      ];
    case "PAID":
      return [
        { status: "PROCESSING", label: "Start processing", Icon: Cog },
        {
          status: "CANCELLED",
          label: "Cancel",
          Icon: XCircle,
          variant: "destructive",
        },
      ];
    case "PROCESSING":
      return [{ status: "SHIPPED", label: "Mark as shipped", Icon: Truck }];
    case "SHIPPED":
      return [
        {
          status: "DELIVERED",
          label: "Mark as delivered",
          Icon: PackageCheck,
        },
      ];
    default:
      return [];
  }
}

export function OrderStatusControl({
  orderId,
  status,
  paymentMethod,
}: {
  orderId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
}) {
  const [pending, startTransition] = React.useTransition();
  const actions = nextActions(status, paymentMethod);
  if (actions.length === 0) return null;

  function run(next: OrderStatus, label: string) {
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, next);
      if (!result.ok) toast.error(result.error);
      else toast.success(label);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        const { Icon } = action;
        return (
          <Button
            key={action.status}
            variant={action.variant ?? "default"}
            size="sm"
            disabled={pending}
            onClick={() => run(action.status, `${action.label} ✓`)}
            className="gap-1.5"
          >
            <Icon />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
