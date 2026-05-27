import type { OrderFulfillment } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type Props = {
  fulfillment: OrderFulfillment;
  className?: string;
};

export function FulfillmentBadge({ fulfillment, className }: Props) {
  const label = fulfillment === "PICKUP" ? "Pickup" : "Delivery";
  const styles =
    fulfillment === "PICKUP"
      ? "bg-brand-blue-soft text-brand-blue"
      : "bg-muted text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        styles,
        className,
      )}
    >
      {label}
    </span>
  );
}
