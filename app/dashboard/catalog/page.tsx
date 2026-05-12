import Link from "next/link"
import type { Metadata } from "next"
import { Plus, Tag } from "lucide-react"

import { listProducts } from "@/lib/api/products"
import { getCurrentBusiness } from "@/lib/api/business"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/catalog/product-card"
import { CatalogEmpty } from "@/components/catalog/catalog-empty"

export const metadata: Metadata = { title: "Catalog · Acroma" }

export default async function CatalogPage() {
  const [business, products] = await Promise.all([
    getCurrentBusiness(),
    listProducts(),
  ])
  if (!business) return null

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-muted-foreground">Items</p>
          <h1 className="mt-1 font-display text-3xl font-medium tracking-tight text-foreground">
            Catalog
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything Acroma can offer your customers.
          </p>
        </div>

        <Button
          asChild
          className="h-10 gap-1.5 self-start rounded-xl bg-brand-orange px-4 hover:bg-brand-orange/90 sm:self-auto"
        >
          <Link href="/dashboard/catalog/new">
            <Plus />
            Add product
          </Link>
        </Button>
      </header>

      <Link
        href="/dashboard/discounts"
        className="border-border/70 bg-card hover:bg-accent flex items-center justify-between gap-4 rounded-2xl border p-5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="bg-brand-orange-soft text-brand-orange flex size-10 items-center justify-center rounded-xl">
            <Tag className="size-5" />
          </span>
          <div>
            <p className="text-foreground text-sm font-medium">Discount codes</p>
            <p className="text-muted-foreground text-sm">
              Run promos by giving customers a code to type in WhatsApp.
            </p>
          </div>
        </div>
        <span className="text-muted-foreground text-xs">Manage →</span>
      </Link>

      {products.length === 0 ? (
        <CatalogEmpty />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} currency={business.currency} />
          ))}
        </section>
      )}
    </div>
  )
}
