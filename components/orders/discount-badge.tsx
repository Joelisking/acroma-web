import type { Order } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";

type Props = {
  discount: NonNullable<Order["discount"]>;
  discountAmount: number;
  currency: string;
};

export function DiscountBadge({ discount, discountAmount, currency }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green-soft px-2.5 py-1 text-xs font-medium text-brand-green">
      <code className="font-mono">{discount.code}</code>
      <span aria-hidden="true">·</span>
      <span>-{formatMoney(discountAmount, currency)}</span>
    </span>
  );
}
