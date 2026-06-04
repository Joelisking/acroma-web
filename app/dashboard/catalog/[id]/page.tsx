import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft, Pencil, Layers } from "lucide-react";

import { getProduct } from "@/lib/api/products";
import { getCurrentBusiness } from "@/lib/api/business";
import { getVocabulary } from "@/lib/vocabulary";
import { ApiError } from "@/lib/api/server";
import { Button } from "@/components/ui/button";
import { VariantsList } from "@/components/catalog/variants-list";
import { DeleteProductButton } from "@/components/catalog/delete-product-button";
import { SoldOutTodayButton } from "@/components/catalog/sold-out-today-button";
import { tagLabel } from "@/lib/catalog/product-tags";
import { formatMoney } from "@/lib/format";

type PageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Product · Acroma" };

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [business, product] = await Promise.all([
    getCurrentBusiness(),
    safeGetProduct(id),
  ]);
  if (!business) return null;
  if (!product) notFound();

  const vocab = getVocabulary(business.businessType);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <header className="flex flex-col gap-4">
        <Link
          href="/dashboard/catalog"
          className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1 text-xs font-medium"
        >
          <ChevronLeft className="size-4" />
          {vocab.catalog}
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            {product.category ? (
              <p className="eyebrow text-muted-foreground">
                {product.category}
              </p>
            ) : null}
            <h1 className="font-display text-foreground mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
              {product.name}
            </h1>
            <p className="font-display text-foreground mt-1 text-2xl font-medium tabular-nums">
              {formatMoney(product.basePrice, business.currency)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href={`/dashboard/catalog/${product.id}/edit`}>
                  <Pencil />
                  Edit
                </Link>
              </Button>
              <DeleteProductButton productId={product.id} />
            </div>
            <SoldOutTodayButton
              productId={product.id}
              soldOutAt={product.soldOutAt}
            />
          </div>
        </div>
      </header>

      {product.tags && product.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="bg-brand-blue-soft text-brand-blue rounded-full px-2.5 py-1 text-xs font-medium"
            >
              {tagLabel(tag)}
            </span>
          ))}
        </div>
      ) : null}

      {product.imageUrl ? (
        <div className="border-border/70 bg-muted relative overflow-hidden rounded-2xl border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt=""
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
      ) : null}

      {product.description ? (
        <section className="border-border/70 bg-card rounded-2xl border p-6">
          <p className="eyebrow text-muted-foreground">Description</p>
          <p className="text-foreground mt-2 text-sm leading-relaxed whitespace-pre-wrap">
            {product.description}
          </p>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-foreground text-sm font-semibold">Variants</h2>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <Link href={`/dashboard/catalog/${product.id}/variants`}>
              <Layers />
              {product.hasVariants ? "Manage variants" : "Add variants"}
            </Link>
          </Button>
        </div>
        {product.variants && product.variants.length > 0 ? (
          <VariantsList
            variants={product.variants}
            basePrice={product.basePrice}
            currency={business.currency}
            tracksStock={vocab.tracksStock}
          />
        ) : (
          <p className="text-muted-foreground text-sm">
            No {vocab.variantsHeading.toLowerCase()}.
            {vocab.tracksStock
              ? ` ${product.stock} units in stock at base price.`
              : ""}
          </p>
        )}
      </section>
    </div>
  );
}

async function safeGetProduct(id: string) {
  try {
    return await getProduct(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
