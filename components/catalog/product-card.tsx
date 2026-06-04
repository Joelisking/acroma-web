import Link from "next/link";
import { Package } from "lucide-react";
import type { Product } from "@/lib/api/types";
import { isSoldOutToday } from "@/lib/catalog/sold-out";
import { formatMoney } from "@/lib/format";
import { tagLabel } from "@/lib/catalog/product-tags";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  currency,
  tracksStock = true,
}: {
  product: Product;
  currency: string;
  /** Food merchants don't track stock — show availability instead of a count. */
  tracksStock?: boolean;
}) {
  const soldOutToday = isSoldOutToday(product.soldOutAt);
  return (
    <Link
      href={`/dashboard/catalog/${product.id}`}
      className={cn(
        "group/card border-border/70 bg-card focus-visible:ring-ring/40 hover:bg-accent/40 flex flex-col overflow-hidden rounded-2xl border transition-colors",
        "focus-visible:ring-2 focus-visible:outline-none",
      )}
    >
      <div className="bg-muted relative aspect-[4/3] overflow-hidden">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover/card:scale-[1.03]"
          />
        ) : (
          <div className="text-muted-foreground absolute inset-0 flex items-center justify-center">
            <Package className="size-10" strokeWidth={1.25} />
          </div>
        )}
        {!product.isActive ? (
          <span className="bg-background/85 text-muted-foreground absolute top-2 left-2 rounded-full px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider">
            Hidden
          </span>
        ) : soldOutToday ? (
          <span className="bg-brand-orange/90 text-white absolute top-2 left-2 rounded-full px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider">
            Sold out today
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.category ? (
          <p className="eyebrow text-muted-foreground text-[0.65rem]">
            {product.category}
          </p>
        ) : null}
        <p className="text-foreground line-clamp-2 text-sm font-medium">
          {product.name}
        </p>
        {product.tags && product.tags.length > 0 ? (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="bg-brand-blue-soft text-brand-blue rounded-full px-2 py-0.5 text-[0.65rem] font-medium"
              >
                {tagLabel(tag)}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-auto flex items-baseline justify-between pt-2">
          <span className="font-display text-foreground text-lg font-medium tabular-nums">
            {formatMoney(product.basePrice, currency)}
          </span>
          <span className="text-muted-foreground text-xs tabular-nums">
            {soldOutToday
              ? "Back tomorrow"
              : tracksStock
                ? `${product.stock} in stock`
                : "Available"}
          </span>
        </div>
      </div>
    </Link>
  );
}
