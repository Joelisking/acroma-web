import type { Metadata } from "next";

import { ErrorGroups } from "@/components/admin/error-groups";
import { FilterBar } from "@/components/admin/filter-bar";
import { rangeToFrom } from "@/lib/admin/format";
import { listLogGroups } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Errors · Admin · Acroma" };

type Props = { searchParams: Promise<{ range?: string }> };

export default async function AdminErrorsPage({ searchParams }: Props) {
  const { range } = await searchParams;
  // The backend defaults to the last 24h; "All time" is not offered here.
  const active = range ?? "24h";
  const groups = await listLogGroups({ from: rangeToFrom(active) });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-heading text-2xl font-medium">Errors</h1>
        <p className="text-sm text-muted-foreground">
          Warnings and errors across all merchants, grouped by message.
          {range ? "" : " Showing the last 24 hours."}
        </p>
      </header>
      <FilterBar basePath="/admin/errors" params={{ range: active }} ranges allTime={false} />
      <ErrorGroups groups={groups} />
    </div>
  );
}
