import Link from "next/link";
import { Package } from "lucide-react";

import type { Product } from "@/lib/api/types";
import { isSoldOutToday } from "@/lib/catalog/sold-out";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { StatusPill } from "@/components/shared/status-pill";
import { MenuItemToggle } from "./menu-item-toggle";

type Props = {
  product: Product;
  currency: string;
};

/**
 * One menu item: thumbnail + name/price (links to the item) and an inline
 * availability switch. Sold-out items read struck-through and dimmed.
 */
export function MenuItemRow({ product, currency }: Props) {
  const soldOut = isSoldOutToday(product.soldOutAt);
  const hidden = !product.isActive;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-3",
        (soldOut || hidden) && "opacity-70",
      )}
    >
      <Link
        href={`/dashboard/catalog/${product.id}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <span className="bg-muted text-muted-foreground flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <Package className="size-6" strokeWidth={1.4} />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "text-foreground block truncate text-sm font-semibold",
              soldOut && "line-through",
            )}
          >
            {product.name}
          </span>
          <span className="text-foreground block text-sm tabular-nums">
            {formatMoney(product.basePrice, currency)}
          </span>
        </span>
      </Link>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <StatusPill tone={hidden ? "muted" : soldOut ? "orange" : "green"}>
          {hidden ? "Hidden" : soldOut ? "Sold out today" : "Available"}
        </StatusPill>
        <MenuItemToggle productId={product.id} soldOutAt={product.soldOutAt} />
      </div>
    </div>
  );
}
