import { FilterBar } from "@/components/admin/filter-bar";
import { LoadMore } from "@/components/admin/merchant/load-more";
import { LogsTable } from "@/components/admin/merchant/logs-table";
import { pickLevel, rangeToFrom } from "@/lib/admin/format";
import { listMerchantLogs } from "@/lib/admin/queries";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ level?: string; range?: string; cursor?: string }>;
};

export default async function MerchantLogsPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const { range, cursor } = sp;
  const level = pickLevel(sp.level);
  const page = await listMerchantLogs(id, {
    level,
    from: rangeToFrom(range),
    cursor,
  });
  const base = `/admin/businesses/${id}/logs`;

  return (
    <div className="flex flex-col gap-4">
      <FilterBar basePath={base} params={{ level, range }} levels ranges />
      <LogsTable items={page.items} />
      <LoadMore basePath={base} params={{ level, range, cursor }} nextCursor={page.nextCursor} />
    </div>
  );
}
