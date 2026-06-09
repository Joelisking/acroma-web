import type { BusinessType, PaymentMethod } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type Props = {
  method: PaymentMethod;
  businessType?: BusinessType | null;
  className?: string;
};

export function PaymentMethodBadge({ method, businessType, className }: Props) {
  // Services are paid in person at the merchant's location, not "on delivery".
  const codLabel =
    businessType === "SERVICES" ? "Pay in person" : "Cash on delivery";
  const label = method === "CASH_ON_DELIVERY" ? codLabel : "Mobile money";
  const styles =
    method === "CASH_ON_DELIVERY"
      ? "bg-brand-orange-soft text-brand-orange"
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
