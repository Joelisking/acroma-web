import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

type Props = {
  price: number
  regularPrice: number
  currency: string
  className?: string
}

/** The price charged now, with the regular price struck through when a promo lowers or changes it. */
export function PromoPrice({
  price,
  regularPrice,
  currency,
  className,
}: Props) {
  const promo = price !== regularPrice
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1.5 tabular-nums",
        className
      )}
    >
      <span className={cn(promo && "font-semibold text-brand-orange")}>
        {formatMoney(price, currency)}
      </span>
      {promo ? (
        <span className="text-xs text-muted-foreground line-through">
          {formatMoney(regularPrice, currency)}
        </span>
      ) : null}
    </span>
  )
}
