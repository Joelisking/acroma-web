"use client"

import { Truck } from "lucide-react"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

type DeliverySummaryProps = {
  orders: number
  pickups: number
  fees: number
  currency: string
  className?: string
}

/**
 * How many orders went out for delivery over the range, and what the delivery
 * charges brought in. The fee figure is deliberately separate from the revenue
 * total above it: product revenue strips the delivery fee out so dishes are
 * not inflated by rider trips, which leaves this as the one place it shows.
 *
 * Pickups ride along as the denominator, so "12 deliveries" reads against the
 * night's total rather than as a number on its own.
 */
export function DeliverySummary({
  orders,
  pickups,
  fees,
  currency,
  className,
}: DeliverySummaryProps) {
  if (orders <= 0 && fees <= 0) return null

  return (
    <div className={cn("flex flex-wrap gap-x-6 gap-y-1", className)}>
      <div className="flex items-center gap-2">
        <span className="flex items-center text-brand-orange">
          <Truck className="size-3.5" />
        </span>
        <span className="text-sm text-muted-foreground">Deliveries</span>
        <span className="text-sm font-semibold text-foreground tabular-nums">
          {orders}
        </span>
        {pickups > 0 ? (
          <span className="text-xs text-muted-foreground tabular-nums">
            · {pickups} {pickups === 1 ? "pickup" : "pickups"}
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Delivery fees</span>
        <span className="text-sm font-semibold text-foreground tabular-nums">
          {formatMoney(fees, currency)}
        </span>
      </div>
    </div>
  )
}
