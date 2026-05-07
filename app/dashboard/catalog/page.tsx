import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";

import { listProducts } from "@/lib/api/products";
import { getCurrentBusiness } from "@/lib/api/business";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/catalog/product-card";
import { CatalogEmpty } from "@/components/catalog/catalog-empty";

export const metadata: Metadata = { title: "Catalog · Acroma" };

export default async function CatalogPage() {
  const [business, products] = await Promise.all([
    getCurrentBusiness(),
    listProducts(),
  ]);
  if (!business) return null;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-muted-foreground">Items</p>
          <h1 className="font-display text-foreground mt-1 text-3xl font-medium tracking-tight">
            Catalog
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Everything Acroma can offer your customers.
          </p>
        </div>

        <Button
          asChild
          className="bg-brand-orange hover:bg-brand-orange/90 h-10 gap-1.5 self-start rounded-xl px-4 sm:self-auto"
        >
          <Link href="/dashboard/catalog/new">
            <Plus />
            Add product
          </Link>
        </Button>
      </header>

      {products.length === 0 ? (
        <CatalogEmpty />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              currency={business.currency}
            />
          ))}
        </section>
      )}
    </div>
  );
}
