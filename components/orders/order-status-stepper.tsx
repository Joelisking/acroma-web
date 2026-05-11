import { Check } from "lucide-react";
import type { OrderStatus, PaymentMethod } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type Step = { status: OrderStatus; label: string };

const MOMO_STEPS: Step[] = [
  { status: "PENDING", label: "Received" },
  { status: "PAID", label: "Paid" },
  { status: "PROCESSING", label: "Processing" },
  { status: "SHIPPED", label: "Shipped" },
  { status: "DELIVERED", label: "Delivered" },
];

const COD_STEPS: Step[] = [
  { status: "PENDING", label: "Received" },
  { status: "PROCESSING", label: "Processing" },
  { status: "SHIPPED", label: "Shipped" },
  { status: "DELIVERED", label: "Delivered" },
  { status: "PAID", label: "Cash received" },
];

const MOMO_INDEX: Record<OrderStatus, number> = {
  PENDING: 0,
  PAYMENT_PENDING: 0,
  PAID: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: -1,
  PAYMENT_FAILED: -1,
};

const COD_INDEX: Record<OrderStatus, number> = {
  PENDING: 0,
  PROCESSING: 1,
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
}: {
  status: OrderStatus;
  paymentMethod: PaymentMethod;
}) {
  const steps = paymentMethod === "CASH_ON_DELIVERY" ? COD_STEPS : MOMO_STEPS;
  const index = paymentMethod === "CASH_ON_DELIVERY" ? COD_INDEX : MOMO_INDEX;
  const current = index[status];
  const halted = status === "CANCELLED" || status === "PAYMENT_FAILED";

  if (halted) {
    return (
      <p className="text-muted-foreground text-sm">
        This order is no longer active.
      </p>
    );
  }

  return (
    <ol className="grid grid-cols-5 gap-2">
      {steps.map((step, i) => {
        const reached = i <= current;
        const isCurrent = i === current;
        return (
          <li key={step.status} className="flex flex-col items-center gap-2">
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
