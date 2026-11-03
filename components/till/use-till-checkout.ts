"use client"

import * as React from "react"
import { toast } from "sonner"
import type { Business, Order, OrderFulfillment } from "@/lib/api/types"
import { applyQuote, toOrderLines, type CartLine } from "@/lib/till"
import { createOrderAction, quoteOrderAction } from "@/lib/api/orders-actions"
import { formatMoney } from "@/lib/format"
import { useConfirmedAction } from "@/components/impersonation/use-confirmed-action"

type Args = {
  business: Business
  lines: CartLine[]
  setLines: (lines: CartLine[]) => void
  phone: string
  fulfillment: OrderFulfillment
  address: string
  setAddressTouched: (v: boolean) => void
  deliveryFee: number
  add: (order: Order) => void
  setCharging: (order: Order) => void
  resetCart: () => void
}

/** Rings up the cart: re-prices it first, then creates the till order. */
export function useTillCheckout({
  business,
  lines,
  setLines,
  phone,
  fulfillment,
  address,
  setAddressTouched,
  deliveryFee,
  add,
  setCharging,
  resetCart,
}: Args) {
  const [busy, setBusy] = React.useState(false)
  const confirm = useConfirmedAction()

  async function createOrder(paymentMethod: "MOMO" | "CASH_ON_DELIVERY") {
    // You cannot deliver to nowhere. Surface it before taking any money.
    if (fulfillment === "DELIVERY" && address.trim().length === 0) {
      setAddressTouched(true)
      toast.error("Add where the order is going first.")
      return
    }
    setBusy(true)
    // A screen left open across a promotion's start or end shows stale prices.
    // Re-price first and stop if anything moved, so staff see the new total
    // before any money is taken. The re-price and the create share one confirm
    // so a logged-in-as-merchant admin sees a single dialog.
    const outcome = await confirm(
      {
        title: `Ring up till sale of ${lines.length} ${lines.length === 1 ? "item" : "items"}`,
        description:
          paymentMethod === "MOMO"
            ? "Creates the order and a payment link."
            : "Creates the order as paid in cash.",
        confirmLabel: "Charge",
      },
      async () => {
        const quote = await quoteOrderAction(toOrderLines(lines))
        if (!quote.ok) return { kind: "quote-failed" as const, quote }
        const repriced = applyQuote(lines, quote.data.lines)
        if (repriced.changed) {
          return { kind: "repriced" as const, quote, repriced }
        }
        const res = await createOrderAction({
          source: "TILL",
          // Blank means walk-in; the backend substitutes its marker rather
          // than storing an empty string.
          ...(phone.trim() ? { customerPhone: phone.trim() } : {}),
          fulfillment,
          ...(fulfillment === "DELIVERY"
            ? { deliveryAddress: address.trim() }
            : {}),
          paymentMethod,
          items: toOrderLines(lines),
        })
        return { kind: "created" as const, res }
      }
    )
    if (!outcome) {
      setBusy(false)
      return
    }
    if (outcome.kind === "quote-failed") {
      // Can't confirm today's prices, so take no money on the old ones.
      setBusy(false)
      const error = outcome.quote.ok ? "" : outcome.quote.error
      toast.error(`${error}. Nothing was charged, try again.`)
      return
    }
    if (outcome.kind === "repriced") {
      setBusy(false)
      setLines(outcome.repriced.lines)
      const subtotal = outcome.quote.ok ? outcome.quote.data.subtotal : 0
      toast.warning(
        `Prices changed since this screen loaded. New total: ${formatMoney(subtotal + deliveryFee, business.currency)}. Check the cart and charge again.`
      )
      return
    }
    const res = outcome.res
    setBusy(false)

    if (!res.ok) {
      toast.error(res.error)
      return
    }
    const order = res.data

    if (paymentMethod === "CASH_ON_DELIVERY") {
      // Cash is already in the drawer, so the order is created paid and there
      // is nothing to wait for.
      toast.success("Paid in cash.")
      resetCart()
      return
    }

    if (!order.paystackAuthUrl) {
      // Almost always an unconfigured Paystack subaccount. The order exists and
      // is recoverable from the board, so say what happened rather than
      // pretending the sale succeeded.
      toast.error(
        "Order created, but no payment link came back. Take cash or check your payment setup."
      )
      add(order)
      resetCart()
      return
    }

    add(order)
    setCharging(order)
    resetCart()
  }

  return { busy, createOrder }
}
