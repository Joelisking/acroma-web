"use client"

import type { Product } from "@/lib/api/types"
import { isSoldOutToday } from "@/lib/catalog/sold-out"
import { cn } from "@/lib/utils"
import { PromoPrice } from "@/components/promotions/promo-price"

type Props = {
  product: Product
  currency: string
  onPick: (p: Product) => void
}

/** One tappable item. A promo price shows with the regular price struck through. */
export function TillProductTile({ product, currency, onPick }: Props) {
  const soldOut = isSoldOutToday(product.soldOutAt)
  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={() => onPick(product)}
      className={cn(
        "card-warm flex min-h-20 flex-col justify-between gap-1 p-3 text-left transition-transform",
        soldOut
          ? "cursor-not-allowed opacity-40"
          : "hover:border-brand-orange active:scale-[0.98]"
      )}
    >
      <span className="line-clamp-2 text-sm font-semibold text-foreground">
        {product.name}
      </span>
      {soldOut ? (
        <span className="text-sm font-bold text-muted-foreground">
          Sold out
        </span>
      ) : (
        <PromoPrice
          price={product.effectivePrice ?? product.basePrice}
          regularPrice={product.basePrice}
          currency={currency}
          className="text-sm font-bold text-brand-orange"
        />
      )}
    </button>
  )
}
