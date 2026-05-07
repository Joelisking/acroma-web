import type { OrderItem } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";

export function OrderItems({
  items,
  currency,
}: {
  items: OrderItem[];
  currency: string;
}) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No items on this order.</p>
    );
  }

  return (
    <ul className="border-border/70 bg-card divide-border/70 divide-y overflow-hidden rounded-2xl border">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center gap-4 px-4 py-3.5 text-sm"
        >
          <span
            aria-hidden
            className="bg-muted text-muted-foreground inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold tabular-nums"
          >
            ×{item.quantity}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate font-medium">
              {item.product.name}
            </p>
            <p className="text-muted-foreground text-xs tabular-nums">
              {formatMoney(item.unitPrice, currency)} each
            </p>
          </div>
          <span className="font-display text-foreground text-base font-medium tabular-nums">
            {formatMoney(item.unitPrice * item.quantity, currency)}
          </span>
        </li>
      ))}
    </ul>
  );
}
