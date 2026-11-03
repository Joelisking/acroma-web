import type { Metadata } from "next";

import { FilterBar } from "@/components/admin/filter-bar";
import { MerchantTable } from "@/components/admin/merchant-table";
import { LoadMore } from "@/components/admin/merchant/load-more";
import { listMerchants } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Merchants · Admin · Acroma" };

type Props = { searchParams: Promise<{ q?: string; cursor?: string }> };

export default async function AdminMerchantsPage({ searchParams }: Props) {
  const { q, cursor } = await searchParams;
  const page = await listMerchants({ q, cursor });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-heading text-2xl font-medium">Merchants</h1>
        <p className="text-sm text-muted-foreground">
          Search by name, email or phone.
        </p>
      </header>
      <FilterBar
        basePath="/admin"
        params={{ q }}
        fields={[{ name: "q", label: "Search", placeholder: "Name, email or phone" }]}
      />
      <MerchantTable items={page.items} />
      <LoadMore basePath="/admin" params={{ q, cursor }} nextCursor={page.nextCursor} />
    </div>
  );
}
