import { CheckCircle2 } from "lucide-react";

import type { Product } from "@/lib/api/types";
import { isSoldOutToday } from "@/lib/catalog/sold-out";
import { groupByCategory } from "@/lib/catalog/categories";
import { MenuItemRow } from "./menu-item-row";

type Props = {
  products: Product[];
  currency: string;
};

/**
 * Food "menu" view: an availability summary plus items grouped into category
 * sections (Cocktails, Fruity, etc.), each with an inline sold-out-today
 * switch. Used in place of the product grid for food merchants.
 */
export function MenuList({ products, currency }: Props) {
  const available = products.filter(
    (p) => p.isActive && !isSoldOutToday(p.soldOutAt),
  ).length;
  const groups = groupByCategory(products);

  return (
    <div className="flex flex-col gap-5">
      <div className="card-warm flex items-center gap-3 p-4">
        <span className="bg-brand-green-soft text-brand-green flex size-10 shrink-0 items-center justify-center rounded-xl">
          <CheckCircle2 className="size-5" />
        </span>
        <div>
          <p className="text-sm font-semibold">{available} available</p>
          <p className="text-muted-foreground text-xs">
            Sold-out flags clear every morning.
          </p>
        </div>
      </div>

      {groups.map((group) => (
        <section
          key={group.category ?? "__uncategorized"}
          className="flex flex-col gap-2"
        >
          {group.category || groups.length > 1 ? (
            <p className="eyebrow text-muted-foreground px-1">
              {group.category ?? "Other"}
            </p>
          ) : null}
          <div className="card-warm divide-border/70 divide-y overflow-hidden">
            {group.items.map((product) => (
              <MenuItemRow
                key={product.id}
                product={product}
                currency={currency}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
