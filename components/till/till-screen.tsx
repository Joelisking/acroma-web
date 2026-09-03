"use client"

import * as React from "react"
import { toast } from "sonner"
import type { Business, Order, Product, ProductVariant } from "@/lib/api/types"
import {
  addLine,
  cartLineFromProduct,
  lineKey,
  setQuantity,
  toOrderLines,
  type CartLine,
} from "@/lib/till"
import { createOrderAction } from "@/lib/api/orders-actions"
import { TillCatalog } from "./till-catalog"
import { TillCart } from "./till-cart"
import { TillTickets, type Ticket } from "./till-tickets"
import { TillChargeDialog } from "./till-charge-dialog"
import { VariantDialog } from "./variant-dialog"
import { CustomLineDialog } from "./custom-line-dialog"
import { useTillTickets } from "./use-till-tickets"
import { TillCartBar } from "./till-cart-bar"

type TillScreenProps = {
  business: Business
  products: Product[]
  /** Variants preloaded per product, so choosing a size costs no round trip. */
  variantsByProduct: Record<string, ProductVariant[]>
  /** Today's counter orders still waiting on payment, so a reload keeps them. */
  openTickets: Ticket[]
}

/**
 * The counter till. One screen at every width: the cart sits in a right-hand
 * rail on a tablet and drops beneath the catalog on a phone.
 */
export function TillScreen({
  business,
  products,
  variantsByProduct,
  openTickets,
}: TillScreenProps) {
  const [lines, setLines] = React.useState<CartLine[]>([])
  const [phone, setPhone] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [variantFor, setVariantFor] = React.useState<Product | null>(null)
  const [customOpen, setCustomOpen] = React.useState(false)
  const [charging, setCharging] = React.useState<Order | null>(null)
  const { tickets, add, remove } = useTillTickets(business.id, openTickets)

  function handlePick(product: Product) {
    if (product.hasVariants) {
      setVariantFor(product)
      return
    }
    setLines((current) => addLine(current, cartLineFromProduct(product)))
  }

  function handleVariantPick(variant: ProductVariant) {
    if (!variantFor) return
    setLines((current) =>
      addLine(current, cartLineFromProduct(variantFor, variant))
    )
    setVariantFor(null)
  }

  function handleCustomAdd(name: string, unitPrice: number) {
    setLines((current) =>
      addLine(current, {
        key: lineKey(null, null, name),
        productId: null,
        variantId: null,
        name,
        unitPrice,
        quantity: 1,
      })
    )
  }

  function resetCart() {
    setLines([])
    setPhone("")
  }

  async function createOrder(paymentMethod: "MOMO" | "CASH_ON_DELIVERY") {
    setBusy(true)
    const res = await createOrderAction({
      source: "TILL",
      // Blank means walk-in; the backend substitutes its marker rather than
      // storing an empty string.
      ...(phone.trim() ? { customerPhone: phone.trim() } : {}),
      fulfillment: "PICKUP",
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

  function handleOpenTicket(ticket: Ticket) {
    setCharging(ticket.order)
  }

  // The charge dialog holds the order it was opened with; tickets update over
  // the socket, so re-read the live row before rendering.
  const chargingLive =
    tickets.find((t) => t.order.id === charging?.id)?.order ?? charging

  // One cart, rendered into whichever surface the screen has room for.
  const cart = (
    <TillCart
      lines={lines}
      currency={business.currency}
      phone={phone}
      onPhoneChange={setPhone}
      onQuantityChange={(key, quantity) =>
        setLines((current) => setQuantity(current, key, quantity))
      }
      onClear={resetCart}
      onCharge={() => void createOrder("MOMO")}
      onCash={() => void createOrder("CASH_ON_DELIVERY")}
      busy={busy}
    />
  )

  return (
    <div className="flex flex-col gap-4">
      <TillTickets tickets={tickets} onOpen={handleOpenTicket} />

      <div className="grid gap-4 md:grid-cols-[1fr_17rem] md:items-start lg:grid-cols-[1fr_20rem]">
        <TillCatalog
          products={products}
          currency={business.currency}
          onPick={handlePick}
          onCustom={() => setCustomOpen(true)}
        />

        {/* Tablet and up: the cart lives in a rail beside the tiles. */}
        <div className="card-warm hidden bg-card p-4 md:sticky md:top-4 md:block">
          {cart}
        </div>
      </div>

      {/* Phone: a bar above the nav that opens the cart in a sheet. */}
      <TillCartBar lines={lines} currency={business.currency}>
        {cart}
      </TillCartBar>

      <VariantDialog
        product={variantFor}
        variants={variantFor ? (variantsByProduct[variantFor.id] ?? []) : []}
        currency={business.currency}
        open={variantFor !== null}
        onOpenChange={(open) => !open && setVariantFor(null)}
        onPick={handleVariantPick}
      />

      <CustomLineDialog
        open={customOpen}
        currency={business.currency}
        onOpenChange={setCustomOpen}
        onAdd={handleCustomAdd}
      />

      <TillChargeDialog
        order={chargingLive}
        open={charging !== null}
        onOpenChange={(open) => !open && setCharging(null)}
        onNext={() => setCharging(null)}
        onCancelled={(order) => remove(order.id)}
      />
    </div>
  )
}
