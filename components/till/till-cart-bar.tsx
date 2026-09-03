"use client"

import * as React from "react"
import { ShoppingBag } from "lucide-react"
import type { CartLine } from "@/lib/till"
import { cartCount, cartTotal } from "@/lib/till"
import { formatMoney } from "@/lib/format"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"

type TillCartBarProps = {
  lines: CartLine[]
  currency: string
  children: React.ReactNode
}

/**
 * The cart on a phone.
 *
 * A tablet (md and up, so an iPad in portrait too) has room to keep the whole
 * cart open in a side rail; a phone does not, and a cart pinned to the bottom
 * of a small screen buries the very tiles the worker is trying to tap. So on a
 * phone it collapses to a bar showing what matters mid-order (how many items,
 * how much) and opens the full cart in a sheet when tapped.
 *
 * Sits above the bottom nav rather than under it.
 */
export function TillCartBar({ lines, currency, children }: TillCartBarProps) {
  const [open, setOpen] = React.useState(false)
  const count = cartCount(lines)

  // An empty cart has nothing to summarise and no action to offer, so the bar
  // stays out of the way until the first tap.
  if (count === 0) return null

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-30 px-4 [padding-bottom:calc(env(safe-area-inset-bottom)+5.5rem)] md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-between rounded-2xl bg-brand-orange px-4 py-3.5 text-primary-foreground shadow-lg"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <ShoppingBag className="size-4" />
            {count} item{count === 1 ? "" : "s"}
          </span>
          <span className="text-base font-bold tabular-nums">
            {formatMoney(cartTotal(lines), currency)}
          </span>
        </button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] overflow-y-auto p-4"
        >
          <SheetTitle className="sr-only">Current order</SheetTitle>
          {children}
        </SheetContent>
      </Sheet>
    </>
  )
}
