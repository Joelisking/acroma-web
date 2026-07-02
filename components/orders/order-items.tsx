import type { OrderItem } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";

type Props = {
  items: OrderItem[];
  currency: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  discountCode: string | null;
};

export function OrderItems({
  items,
  currency,
  subtotal,
  discountAmount,
  total,
  discountCode,
}: Props) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No items on this order.</p>
    );
  }

  return (
    <>
      <ul className="card-warm divide-border/70 divide-y overflow-hidden">
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
                {item.product?.name ?? item.productName ?? "Item"}
              </p>
              <p className="text-muted-foreground text-xs tabular-nums">
                {formatMoney(item.unitPrice, currency)} each
              </p>
            </div>
            <span className="text-foreground text-base font-bold tracking-tight tabular-nums">
              {formatMoney(item.unitPrice * item.quantity, currency)}
            </span>
          </li>
        ))}
      </ul>
      {discountAmount > 0 ? (
        <dl className="border-border/70 mt-4 space-y-1 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="text-foreground">{formatMoney(subtotal, currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              Discount{discountCode ? ` (${discountCode})` : ""}
            </dt>
            <dd className="text-brand-green">-{formatMoney(discountAmount, currency)}</dd>
          </div>
          <div className="border-border/40 mt-2 flex justify-between border-t pt-2 text-base font-medium">
            <dt>Total</dt>
            <dd>{formatMoney(total, currency)}</dd>
          </div>
        </dl>
      ) : null}
    </>
  );
}
