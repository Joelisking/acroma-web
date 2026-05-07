import {
  Clock,
  Hourglass,
  CheckCircle2,
  Cog,
  Truck,
  PackageCheck,
  XCircle,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import type { OrderStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type Meta = {
  label: string;
  Icon: LucideIcon;
  className: string;
};

const META: Record<OrderStatus, Meta> = {
  PENDING: {
    label: "Pending",
    Icon: Clock,
    className: "bg-muted text-muted-foreground",
  },
  PAYMENT_PENDING: {
    label: "Awaiting payment",
    Icon: Hourglass,
    className: "bg-brand-orange-soft text-brand-orange",
  },
  PAID: {
    label: "Paid",
    Icon: CheckCircle2,
    className: "bg-brand-green-soft text-brand-green",
  },
  PROCESSING: {
    label: "Processing",
    Icon: Cog,
    className: "bg-brand-blue-soft text-brand-blue",
  },
  SHIPPED: {
    label: "Shipped",
    Icon: Truck,
    className: "bg-brand-blue-soft text-brand-blue",
  },
  DELIVERED: {
    label: "Delivered",
    Icon: PackageCheck,
    className: "bg-brand-green-soft text-brand-green",
  },
  CANCELLED: {
    label: "Cancelled",
    Icon: XCircle,
    className: "bg-muted text-muted-foreground",
  },
  PAYMENT_FAILED: {
    label: "Payment failed",
    Icon: AlertCircle,
    className: "bg-destructive/10 text-destructive",
  },
};

type Size = "sm" | "md";

export function OrderStatusBadge({
  status,
  size = "sm",
  className,
}: {
  status: OrderStatus;
  size?: Size;
  className?: string;
}) {
  const meta = META[status];
  const { Icon } = meta;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-[0.7rem]" : "px-2.5 py-1 text-xs",
        meta.className,
        className,
      )}
    >
      <Icon
        className={size === "sm" ? "size-3" : "size-3.5"}
        strokeWidth={2.25}
      />
      {meta.label}
    </span>
  );
}

export const ORDER_STATUS_META = META;
