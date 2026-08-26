import Link from "next/link"
import type { Metadata } from "next"
import { Plus } from "lucide-react"

import { listProducts } from "@/lib/api/products"
import { getCurrentBusiness } from "@/lib/api/business"
import { getVocabulary } from "@/lib/vocabulary"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { ProductCard } from "@/components/catalog/product-card"
import { MenuList } from "@/components/catalog/menu-list"
import { CatalogEmpty } from "@/components/catalog/catalog-empty"
import { CatalogImagesSection } from "@/components/catalog/catalog-images-section"
import { redirectStaffToOrders } from "@/lib/api/owner-only"

export const metadata: Metadata = { title: "Catalog · Acroma" }

export default async function CatalogPage() {
  await redirectStaffToOrders()

  const [business, products] = await Promise.all([
    getCurrentBusiness(),
    listProducts(),
  ])
  if (!business) return null

  const vocab = getVocabulary(business.businessType)
  const isFood = business.businessType === "FOOD_BEVERAGES"

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title={isFood ? "Today's menu" : vocab.catalog}
        description={
          isFood
            ? "Flip a switch to mark something sold out for today."
            : "Everything Acroma can offer your customers."
        }
        actions={
          <Button asChild className="h-10 gap-1.5">
            <Link href="/dashboard/catalog/new">
              <Plus />
              Add {vocab.itemLower}
            </Link>
          </Button>
        }
      />

      <CatalogImagesSection
        defaultUrls={business.catalogImageUrls ?? []}
        defaultPdfUrl={business.catalogPdfUrl ?? null}
        noun={vocab.catalog}
      />

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
