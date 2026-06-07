import {
  Clock,
  Hourglass,
  CheckCircle2,
  Cog,
  ChefHat,
  Bell,
  Truck,
  PackageCheck,
  XCircle,
  AlertCircle,
  UserX,
  type LucideIcon,
} from "lucide-react";
import type { BusinessType, OrderStatus } from "@/lib/api/types";
import { getVocabulary } from "@/lib/vocabulary";
import { cn } from "@/lib/utils";

type Meta = {
  label: string;
  Icon: LucideIcon;
  className: string;
};

/**
 * Status badge metadata. The SHIPPED label varies by vertical
 * ("Shipped" vs "Out for delivery") via the vocabulary helper —
 * pass the merchant's businessType so the badge reads naturally for
 * food merchants. PREPARING and READY_FOR_PICKUP are food-vertical
 * intermediate states; non-food orders will never carry them, but
 * the badge still renders them gracefully if seen.
 */
export function statusMeta(
  status: OrderStatus,
  businessType?: BusinessType | null,
): Meta {
  const vocab = getVocabulary(businessType);
  const isServices = businessType === "SERVICES";
  switch (status) {
    case "PENDING":
      return {
        label: "Pending",
        Icon: Clock,
        className: "bg-muted text-muted-foreground",
      };
    case "PAYMENT_PENDING":
      return {
        label: "Awaiting payment",
        Icon: Hourglass,
        className: "bg-brand-orange-soft text-brand-orange",
      };
    case "PAID":
      return {
        label: "Paid",
        Icon: CheckCircle2,
        className: "bg-brand-green-soft text-brand-green",
      };
    case "PROCESSING":
      return {
        label: isServices ? "Confirmed" : "Processing",
        Icon: Cog,
        className: "bg-brand-blue-soft text-brand-blue",
      };
    case "PREPARING":
      return {
        label: "Preparing",
        Icon: ChefHat,
        className: "bg-brand-orange-soft text-brand-orange",
      };
    case "READY_FOR_PICKUP":
      return {
        label: "Ready for pickup",
        Icon: Bell,
        className: "bg-brand-blue-soft text-brand-blue",
      };
    case "SHIPPED":
      return {
        label: vocab.shippedLabel,
        Icon: Truck,
        className: "bg-brand-blue-soft text-brand-blue",
      };
    case "DELIVERED":
      return {
        label: isServices ? "Completed" : "Delivered",
        Icon: PackageCheck,
        className: "bg-brand-green-soft text-brand-green",
      };
    case "NO_SHOW":
      return {
        label: "No-show",
        Icon: UserX,
        className: "bg-muted text-muted-foreground",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        Icon: XCircle,
        className: "bg-muted text-muted-foreground",
      };
    case "PAYMENT_FAILED":
      return {
        label: "Payment failed",
        Icon: AlertCircle,
        className: "bg-destructive/10 text-destructive",
      };
  }
}

type Size = "sm" | "md";

export function OrderStatusBadge({
  status,
  businessType,
  size = "sm",
  className,
}: {
  status: OrderStatus;
  businessType?: BusinessType | null;
  size?: Size;
  className?: string;
}) {
  const meta = statusMeta(status, businessType);
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
