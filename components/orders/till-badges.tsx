import { Calculator, PencilLine } from "lucide-react"
import type { Order } from "@/lib/api/types"
import { cn } from "@/lib/utils"
export { isWalkIn, WALK_IN_PHONE } from "@/lib/walk-in"

/**
 * Whether an order carries a line a worker priced by hand. Catalog lines always
 * carry a productId, so this is derived rather than stored.
 */
export function hasCustomPricing(order: Order): boolean {
  return order.items.some((item) => item.productId === null)
}

const BASE =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"

/** Marks an order as rung up at the counter rather than taken over WhatsApp. */
export function TillBadge({ className }: { className?: string }) {
  return (
    <span className={cn(BASE, "bg-brand-blue-soft text-brand-blue", className)}>
      <Calculator className="size-3" />
      Till
    </span>
  )
}

/**
 * Flags an off-catalog price for the owner. Custom lines are allowed at the
 * till on purpose; this is the review half of that decision.
 */
export function CustomPriceBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(BASE, "bg-brand-orange-soft text-brand-orange", className)}
    >
      <PencilLine className="size-3" />
      Custom price
    </span>
  )
}
