import type { Metadata } from "next"
import { listProducts } from "@/lib/api/products"
import { listOrders } from "@/lib/api/orders"
import { getCurrentBusiness } from "@/lib/api/business"
import type { ProductVariant } from "@/lib/api/types"
import { PageHeader } from "@/components/shared/page-header"
import { TillScreen } from "@/components/till/till-screen"
import { isSellable } from "@/lib/till"

export const metadata: Metadata = { title: "Till · Acroma" }

export default async function TillPage() {
  const [business, products, orders] = await Promise.all([
    getCurrentBusiness(),
    listProducts(),
    listOrders({}),
  ])
  if (!business) return null

  // Counter orders still waiting on payment. Without this a reloaded tablet
  // loses the parked strip and a worker cannot tell who has paid, even though
  // the orders themselves are safe on the board.
  const openTickets = orders
    .filter((o) => o.source === "TILL" && o.status === "PAYMENT_PENDING")
    .map((order) => ({
      order,
      label: `#${order.id.slice(0, 4).toUpperCase()}`,
    }))

  // Variants ride along on the products response, so the size picker costs no
  // extra requests at all.
  //
  // This used to fetch each variant-bearing product's options separately: an
  // N+1 on every till load, and the reason a worker account rang up a whole
  // evening with no sizes on anything. That route was owner-only, so each
  // request 403'd, and a `.catch(() => [])` turned "you are not allowed" into
  // "this product has no options" with nothing on screen to say otherwise. The
  // data was in the products response the whole time, fetched again through a
  // door that happened to be locked.
  const sellableWithVariants = products.filter(
    (p) => p.hasVariants && isSellable(p)
  )
  const variantsByProduct: Record<string, ProductVariant[]> =
    Object.fromEntries(
      sellableWithVariants.map((p) => [
        p.id,
        (p.variants ?? []).filter((v) => v.isActive),
      ])
    )

  // One silent failure survives the change: a product flagged as having
  // options but carrying none rings up at its base price with nothing to
  // choose. Rare, but a worker should hear about it rather than undercharge.
  const variantsUnavailable = sellableWithVariants.filter(
    (p) => (variantsByProduct[p.id] ?? []).length === 0
  ).length

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        title="Till"
        description="Ring up a walk-in and take payment at the counter."
      />
      <TillScreen
        business={business}
        products={products}
        variantsByProduct={variantsByProduct}
        variantsUnavailable={variantsUnavailable}
        openTickets={openTickets}
      />
    </div>
  )
}
