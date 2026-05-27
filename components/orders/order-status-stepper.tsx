import { Check } from "lucide-react";
import type {
  BusinessType,
  OrderStatus,
  PaymentMethod,
} from "@/lib/api/types";
import { getVocabulary } from "@/lib/vocabulary";
import { cn } from "@/lib/utils";

type Step = { status: OrderStatus; label: string };

/**
 * Progress stepper. Non-food merchants keep the five-stage flow
 * (RECEIVED, PAID, PROCESSING, SHIPPED, DELIVERED). Food merchants
 * see "Preparing" instead of "Processing" and "Out for delivery"
 * instead of "Shipped". PREPARING and READY_FOR_PICKUP collapse onto
 * the same visual slot as PROCESSING and SHIPPED so the stepper
 * width stays stable across verticals.
 */
function momoSteps(businessType: BusinessType | null | undefined): Step[] {
  const vocab = getVocabulary(businessType);
  const isFood = businessType === "FOOD_BEVERAGES";
  return [
    { status: "PENDING", label: "Received" },
    { status: "PAID", label: "Paid" },
    {
      status: isFood ? "PREPARING" : "PROCESSING",
      label: isFood ? "Preparing" : "Processing",
    },
    { status: "SHIPPED", label: vocab.shippedLabel },
    { status: "DELIVERED", label: "Delivered" },
  ];
}

function codSteps(businessType: BusinessType | null | undefined): Step[] {
  const vocab = getVocabulary(businessType);
  const isFood = businessType === "FOOD_BEVERAGES";
  return [
    { status: "PENDING", label: "Received" },
    {
      status: isFood ? "PREPARING" : "PROCESSING",
      label: isFood ? "Preparing" : "Processing",
    },
    { status: "SHIPPED", label: vocab.shippedLabel },
    { status: "DELIVERED", label: "Delivered" },
    { status: "PAID", label: "Cash received" },
  ];
}

const MOMO_INDEX: Record<OrderStatus, number> = {
  PENDING: 0,
  PAYMENT_PENDING: 0,
  PAID: 1,
  PROCESSING: 2,
  PREPARING: 2,
  READY_FOR_PICKUP: 3,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: -1,
  PAYMENT_FAILED: -1,
};

const COD_INDEX: Record<OrderStatus, number> = {
  PENDING: 0,
  PROCESSING: 1,
  PREPARING: 1,
  READY_FOR_PICKUP: 2,
  SHIPPED: 2,
  DELIVERED: 3,
  PAID: 4,
  PAYMENT_PENDING: -1,
  PAYMENT_FAILED: -1,
  CANCELLED: -1,
};

export function OrderStatusStepper({
  status,
  paymentMethod,
  businessType,
}: {
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  businessType?: BusinessType | null;
}) {
  const steps =
    paymentMethod === "CASH_ON_DELIVERY"
      ? codSteps(businessType)
      : momoSteps(businessType);
  const index = paymentMethod === "CASH_ON_DELIVERY" ? COD_INDEX : MOMO_INDEX;
  const current = index[status];
  const halted =
    status === "CANCELLED" || status === "PAYMENT_FAILED" || current === -1;

  if (halted) {
    return (
      <p className="text-muted-foreground text-sm">
        This order is no longer active.
      </p>
    );
  }

  return (
    <ol aria-label="Order progress" className="grid grid-cols-5 gap-2">
      {steps.map((step, i) => {
        const reached = i <= current;
        const isCurrent = i === current;
        return (
          <li
            key={step.status}
            aria-current={isCurrent ? "step" : undefined}
            className="flex flex-col items-center gap-2"
          >
            <div
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-[0.65rem] font-semibold transition-colors",
                reached
                  ? "bg-brand-orange text-primary-foreground"
                  : "bg-muted text-muted-foreground",
                isCurrent && "ring-brand-orange/30 ring-4",
              )}
            >
              {reached ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
            </div>
            <span
              className={cn(
                "text-center text-[0.7rem]",
                reached
                  ? "text-foreground font-medium"
                  : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
