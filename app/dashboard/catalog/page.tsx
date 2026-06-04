import Link from "next/link"
import type { Metadata } from "next"
import { Plus, Tag, Users, Megaphone } from "lucide-react"

import { listProducts } from "@/lib/api/products"
import { getCurrentBusiness } from "@/lib/api/business"
import { getVocabulary } from "@/lib/vocabulary"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/catalog/product-card"
import { MenuList } from "@/components/catalog/menu-list"
import { CatalogEmpty } from "@/components/catalog/catalog-empty"
import { CatalogImagesManager } from "@/components/catalog/catalog-images-manager"

export const metadata: Metadata = { title: "Catalog · Acroma" }

export default async function CatalogPage() {
  const [business, products] = await Promise.all([
    getCurrentBusiness(),
    listProducts(),
  ])
  if (!business) return null

  const vocab = getVocabulary(business.businessType)
  const isFood = business.businessType === "FOOD_BEVERAGES"

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-muted-foreground">
            {isFood ? "Today" : vocab.items}
          </p>
          <h1 className="mt-1 font-display text-3xl font-medium tracking-tight text-foreground">
            {isFood ? "Today's menu" : vocab.catalog}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isFood
              ? "Flip a switch to mark something sold out for today."
              : "Everything Acroma can offer your customers."}
          </p>
        </div>

        <Button
          asChild
          className="h-10 gap-1.5 self-start rounded-xl bg-brand-orange px-4 hover:bg-brand-orange/90 sm:self-auto"
        >
          <Link href="/dashboard/catalog/new">
            <Plus />
            Add {vocab.itemLower}
          </Link>
        </Button>
      </header>

      <section className="border-border/70 bg-card flex flex-col gap-4 rounded-2xl border p-5">
        <div>
          <p className="text-foreground text-sm font-medium">
            {vocab.catalog} images
          </p>
          <p className="text-muted-foreground text-sm">
            Upload up to 8 photos of your {vocab.catalog.toLowerCase()}. When
            customers ask what you have, Acroma sends them on WhatsApp, in the
            order you set.
          </p>
        </div>
        <CatalogImagesManager
          defaultUrls={business.catalogImageUrls ?? []}
          noun={vocab.catalog}
        />
      </section>

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

      <Link
        href="/dashboard/customers"
        className="border-border/70 bg-card hover:bg-accent flex items-center justify-between gap-4 rounded-2xl border p-5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="bg-brand-blue-soft text-brand-blue flex size-10 items-center justify-center rounded-xl">
            <Users className="size-5" />
          </span>
          <div>
            <p className="text-foreground text-sm font-medium">Customers</p>
            <p className="text-muted-foreground text-sm">
              Who&apos;s ordered or chatted with you. Toggle opt-out to exclude someone from broadcasts.
            </p>
          </div>
        </div>
        <span className="text-muted-foreground text-xs">View →</span>
      </Link>

      <Link
        href="/dashboard/broadcasts"
        className="border-border/70 bg-card hover:bg-accent flex items-center justify-between gap-4 rounded-2xl border p-5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="bg-brand-green-soft text-brand-green flex size-10 items-center justify-center rounded-xl">
            <Megaphone className="size-5" />
          </span>
          <div>
            <p className="text-foreground text-sm font-medium">Broadcasts</p>
            <p className="text-muted-foreground text-sm">
              Send a campaign-style message to a group of customers.
            </p>
          </div>
        </div>
        <span className="text-muted-foreground text-xs">Open →</span>
      </Link>

      {products.length === 0 ? (
        <CatalogEmpty vocab={vocab} />
      ) : isFood ? (
        <MenuList products={products} currency={business.currency} />
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              currency={business.currency}
              tracksStock={vocab.tracksStock}
            />
          ))}
        </section>
      )}
    </div>
  )
}
