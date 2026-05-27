import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { getCurrentBusiness } from "@/lib/api/business";
import { getVocabulary } from "@/lib/vocabulary";
import { NewProductPageClient } from "@/components/catalog/new-product-page";

export const metadata: Metadata = { title: "New product · Acroma" };

export default async function NewProductPage() {
  const business = await getCurrentBusiness();
  const vocab = getVocabulary(business?.businessType);
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header className="space-y-2">
        <Link
          href="/dashboard/catalog"
          className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1 text-xs font-medium"
        >
          <ChevronLeft className="size-4" />
          {vocab.catalog}
        </Link>
        <h1 className="font-display text-foreground text-3xl font-medium tracking-tight">
          Add a {vocab.itemLower}
        </h1>
      </header>
      <NewProductPageClient businessType={business?.businessType} />
    </div>
  );
}
