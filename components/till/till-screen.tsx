"use client"

import * as React from "react"
import type {
  Business,
  Order,
  OrderFulfillment,
  Product,
  ProductVariant,
  Promotion,
} from "@/lib/api/types"
import {
  addLine,
  cartLineFromProduct,
  lineKey,
  setQuantity,
  type CartLine,
} from "@/lib/till"
import { TillCatalog } from "./till-catalog"
import { TillCart } from "./till-cart"
import { TillTickets, type Ticket } from "./till-tickets"
import { TillChargeDialog } from "./till-charge-dialog"
import { VariantDialog } from "./variant-dialog"
import { CustomLineDialog } from "./custom-line-dialog"
import { useTillTickets } from "./use-till-tickets"
import { TillCartBar } from "./till-cart-bar"
import { TillFulfillment } from "./till-fulfillment"
import { TillVariantsWarning } from "./till-variants-warning"
import { useTillRefresh } from "./use-till-refresh"
import { useTillCheckout } from "./use-till-checkout"

type TillScreenProps = {
  business: Business
  products: Product[]
  /** Variants preloaded per product, so choosing a size costs no round trip. */
  variantsByProduct: Record<string, ProductVariant[]>
  /**
   * How many sellable products are flagged as having options but arrived with
   * none. Surfaced rather than swallowed: an empty picker is indistinguishable
   * from an item that genuinely has one size, so without this a worker cannot
   * tell they are undercharging.
   */
  variantsUnavailable: number
  /** Today's counter orders still waiting on payment, so a reload keeps them. */
  openTickets: Ticket[]
  /** The live promotion, and when the current or next one starts or ends. */
  promotion?: Promotion | null
  priceBoundaries?: (string | null)[]
}

/**
 * The counter till. One screen at every width: the cart sits in a right-hand
 * rail on a tablet and drops beneath the catalog on a phone.
 */
export function TillScreen({
  business,
  products,
  variantsByProduct,
  variantsUnavailable,
  openTickets,
  promotion = null,
  priceBoundaries = [],
}: TillScreenProps) {
  useTillRefresh(priceBoundaries)
  const [lines, setLines] = React.useState<CartLine[]>([])
  const [phone, setPhone] = React.useState("")
  const [fulfillment, setFulfillment] =
    React.useState<OrderFulfillment>("PICKUP")
  const [address, setAddress] = React.useState("")
  const [addressTouched, setAddressTouched] = React.useState(false)
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
    setFulfillment("PICKUP")
    setAddress("")
    setAddressTouched(false)
  }

  // Only charged on delivery, and only what this merchant has configured.
  const deliveryFee =
    fulfillment === "DELIVERY" ? (business.deliveryFee ?? 0) : 0

  const { busy, createOrder } = useTillCheckout({
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
  })

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
      deliveryFee={deliveryFee}
      fulfillment={
        <TillFulfillment
          value={fulfillment}
          onChange={setFulfillment}
          address={address}
          onAddressChange={setAddress}
          deliveryFee={business.deliveryFee ?? 0}
          currency={business.currency}
          showAddressError={addressTouched}
        />
      }
    />
  )

  return (
    <div className="flex flex-col gap-4">
      <TillVariantsWarning count={variantsUnavailable} />

      <TillTickets tickets={tickets} onOpen={handleOpenTicket} />

      <div className="grid gap-4 md:grid-cols-[1fr_17rem] md:items-start lg:grid-cols-[1fr_20rem]">
        <TillCatalog
          promotion={promotion}
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
