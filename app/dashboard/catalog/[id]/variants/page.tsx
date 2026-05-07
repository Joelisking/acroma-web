import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";

import { getProduct } from "@/lib/api/products";
import { ApiError } from "@/lib/api/server";
import { VariantsEditor } from "@/components/catalog/variants/variants-editor";

type PageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Variants · Acroma" };

export default async function VariantsPage({ params }: PageProps) {
  const { id } = await params;
  const product = await safeGetProduct(id);
  if (!product) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="space-y-2">
        <Link
          href={`/dashboard/catalog/${id}`}
          className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1 text-xs font-medium"
        >
          <ChevronLeft className="size-4" />
          {product.name}
        </Link>
        <h1 className="font-display text-foreground text-3xl font-medium tracking-tight">
          Variants
        </h1>
        <p className="text-muted-foreground text-sm">
          Add the dimensions your product varies by — color, size, storage —
          then set stock and pricing per combination.
        </p>
      </header>

      <VariantsEditor product={product} />
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
