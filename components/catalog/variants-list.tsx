import type { ProductVariant } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";

type VariantsListProps = {
  variants: ProductVariant[];
  basePrice: number;
  currency: string;
  /** Food merchants don't track stock — show availability instead of a count. */
  tracksStock?: boolean;
};

/**
 * Read-only variants list. Editing the variant grid happens on the mobile
 * app today; we'll port the editor in a follow-up slice.
 */
export function VariantsList({
  variants,
  basePrice,
  currency,
  tracksStock = true,
}: VariantsListProps) {
  if (variants.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No variants on this product.
      </p>
    );
  }

  return (
    <ul className="border-border/70 bg-card divide-border/70 divide-y overflow-hidden rounded-2xl border">
      {variants.map((v) => {
        const price = v.priceOverride ?? basePrice;
        return (
          <li key={v.id} className="flex items-center gap-4 px-4 py-3 text-sm">
            <div className="min-w-0 flex-1">
              <p className="text-foreground truncate font-medium">
                {Object.entries(v.attributes)
                  .map(([k, val]) => `${k}: ${val}`)
                  .join(" · ") || "Default"}
              </p>
              <p className="text-muted-foreground text-xs tabular-nums">
                {tracksStock
                  ? `${v.stock} in stock${!v.isActive ? " · hidden" : ""}`
                  : v.isActive
                    ? "Available"
                    : "Hidden"}
              </p>
            </div>
            <span className="text-foreground text-base font-semibold tabular-nums">
              {formatMoney(price, currency)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
