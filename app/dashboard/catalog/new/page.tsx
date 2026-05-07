import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { NewProductTabs } from "@/components/catalog/new-product-tabs";

export const metadata: Metadata = { title: "New product · Acroma" };

export default function NewProductPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header className="space-y-2">
        <Link
          href="/dashboard/catalog"
          className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1 text-xs font-medium"
        >
          <ChevronLeft className="size-4" />
          Catalog
        </Link>
        <h1 className="font-display text-foreground text-3xl font-medium tracking-tight">
          Add a product
        </h1>
      </header>
      <NewProductTabs />
    </div>
  );
}
