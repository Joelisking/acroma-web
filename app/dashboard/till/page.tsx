import type { Metadata } from "next"
import { listProducts, listVariants } from "@/lib/api/products"
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

  // Preload variants for the items that have them. A worker choosing a size
  // with a customer waiting should not pay for a round trip, and a counter
  // catalog is small enough that this stays cheap.
  const withVariants = products.filter((p) => p.hasVariants && isSellable(p))
  const variantLists = await Promise.all(
    withVariants.map((p) => listVariants(p.id).catch(() => []))
  )
  const variantsByProduct: Record<string, ProductVariant[]> =
    Object.fromEntries(withVariants.map((p, i) => [p.id, variantLists[i]]))

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
        openTickets={openTickets}
      />
    </div>
  )
}
