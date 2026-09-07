import type { OrderItem } from "@/lib/api/types";
import { formatMoney, formatVariantAttributes } from "@/lib/format";

type Props = {
  items: OrderItem[];
  currency: string;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  total: number;
  discountCode: string | null;
};

export function OrderItems({
  items,
  currency,
  subtotal,
  discountAmount,
  deliveryFee,
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
              {item.variant?.attributes ? (
                <p className="text-foreground/80 truncate text-xs font-medium">
                  {formatVariantAttributes(item.variant.attributes)}
                </p>
              ) : null}
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
      {discountAmount > 0 || deliveryFee > 0 ? (
        <dl className="border-border/70 mt-4 space-y-1 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="text-foreground">{formatMoney(subtotal, currency)}</dd>
          </div>
          {discountAmount > 0 ? (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                Discount{discountCode ? ` (${discountCode})` : ""}
              </dt>
              <dd className="text-brand-green">-{formatMoney(discountAmount, currency)}</dd>
            </div>
          ) : null}
          {/* The trip is its own line so a total that sits above the food is
              explained rather than looking like a pricing mistake. */}
          {deliveryFee > 0 ? (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="text-foreground">{formatMoney(deliveryFee, currency)}</dd>
            </div>
          ) : null}
          <div className="border-border/40 mt-2 flex justify-between border-t pt-2 text-base font-medium">
            <dt>Total</dt>
            <dd>{formatMoney(total, currency)}</dd>
          </div>
        </dl>
      ) : null}
    </>
  );
}
