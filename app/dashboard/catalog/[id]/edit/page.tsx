import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";

import { getProduct, listProducts } from "@/lib/api/products";
import { getCurrentBusiness } from "@/lib/api/business";
import { getVocabulary } from "@/lib/vocabulary";
import { distinctCategories } from "@/lib/catalog/categories";
import { ApiError } from "@/lib/api/server";
import { EditProductForm } from "@/components/catalog/edit-product-form";

type PageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Edit product · Acroma" };

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const [product, business, products] = await Promise.all([
    safeGetProduct(id),
    getCurrentBusiness(),
    listProducts().catch(() => []),
  ]);
  if (!product) notFound();
  const vocab = getVocabulary(business?.businessType);
  const categories = distinctCategories(products);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header className="space-y-2">
        <Link
          href={`/dashboard/catalog/${id}`}
          className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1 text-xs font-medium"
        >
          <ChevronLeft className="size-4" />
          {product.name}
        </Link>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">
          Edit {vocab.itemLower}
        </h1>
      </header>
      <EditProductForm
        productId={id}
        businessType={business?.businessType}
        categories={categories}
        defaults={{
          name: product.name,
          description: product.description ?? "",
          basePrice: product.basePrice,
          stock: product.stock,
          estimatedDurationMinutes: product.estimatedDurationMinutes ?? undefined,
          category: product.category ?? "",
          imageUrl: product.imageUrl ?? "",
          isActive: product.isActive,
          tags: product.tags ?? [],
        }}
      />
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
