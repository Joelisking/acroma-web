import type { Metadata } from "next";

import { ActivityTable } from "@/components/admin/activity-table";
import { FilterBar, type ChipGroup } from "@/components/admin/filter-bar";
import { LoadMore } from "@/components/admin/merchant/load-more";
import { pickUuid } from "@/lib/admin/format";
import { listActivity } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Activity · Admin · Acroma" };

type Props = {
  searchParams: Promise<{
    superAdminId?: string;
    businessId?: string;
    cursor?: string;
  }>;
};

const BASE = "/admin/activity";

export default async function AdminActivityPage({ searchParams }: Props) {
  const sp = await searchParams;
  const superAdminId = pickUuid(sp.superAdminId);
  const businessId = pickUuid(sp.businessId);
  const filters = { superAdminId, businessId };
  const page = await listActivity({ ...filters, cursor: sp.cursor });

  // Admin chips: everyone seen on this page, plus the selected one.
  const admins = new Map(page.items.map((a) => [a.superAdminId, a.adminName]));
  const chips: ChipGroup[] = [
    {
      name: "superAdminId",
      options: [
        { value: undefined, label: "All admins" },
        ...[...admins].map(([value, label]) => ({ value, label })),
      ],
    },
  ];
  if (superAdminId && !admins.has(superAdminId)) {
    chips[0].options.push({ value: superAdminId, label: "Selected admin" });
  }
  if (businessId) {
    const name = page.items.find((a) => a.businessId === businessId)?.businessName;
    chips.push({
      name: "businessId",
      options: [
        { value: undefined, label: "All merchants" },
        { value: businessId, label: name ?? "This merchant" },
      ],
    });
  }

  const filterHref = (key: "superAdminId" | "businessId", value: string) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...filters, [key]: value })) if (v) qs.set(k, v);
    return `${BASE}?${qs.toString()}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-heading text-2xl font-medium">Admin activity</h1>
        <p className="text-sm text-muted-foreground">
          What super admins did, newest first. Filter by admin or merchant.
        </p>
      </header>
      <FilterBar basePath={BASE} params={filters} chips={chips} />
      <ActivityTable items={page.items} filterHref={filterHref} />
      <LoadMore
        basePath={BASE}
        params={{ ...filters, cursor: sp.cursor }}
        nextCursor={page.nextCursor}
      />
    </div>
  );
}
