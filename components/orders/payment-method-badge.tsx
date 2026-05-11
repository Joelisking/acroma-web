import type { PaymentMethod } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type Props = {
  method: PaymentMethod;
  className?: string;
};

export function PaymentMethodBadge({ method, className }: Props) {
  const label = method === "CASH_ON_DELIVERY" ? "Cash on delivery" : "Mobile money";
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
