"use client"

import * as React from "react"
import { toast } from "sonner"
import type { Business, Order, OrderFulfillment } from "@/lib/api/types"
import { applyQuote, toOrderLines, type CartLine } from "@/lib/till"
import { createOrderAction, quoteOrderAction } from "@/lib/api/orders-actions"
import { formatMoney } from "@/lib/format"

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
    // before any money is taken.
    const quote = await quoteOrderAction(toOrderLines(lines))
    if (!quote.ok) {
      // Can't confirm today's prices, so take no money on the old ones.
      setBusy(false)
      toast.error(`${quote.error}. Nothing was charged, try again.`)
      return
    }
    const repriced = applyQuote(lines, quote.data.lines)
    if (repriced.changed) {
      setBusy(false)
      setLines(repriced.lines)
      toast.warning(
        `Prices changed since this screen loaded. New total: ${formatMoney(quote.data.subtotal + deliveryFee, business.currency)}. Check the cart and charge again.`
      )
      return
    }
    const res = await createOrderAction({
      source: "TILL",
      // Blank means walk-in; the backend substitutes its marker rather than
      // storing an empty string.
      ...(phone.trim() ? { customerPhone: phone.trim() } : {}),
      fulfillment,
      ...(fulfillment === "DELIVERY"
        ? { deliveryAddress: address.trim() }
        : {}),
      paymentMethod,
      items: toOrderLines(lines),
    })
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
