import type { Metadata } from "next";

import { ActivityTable } from "@/components/admin/activity-table";
import { LoadMore } from "@/components/admin/merchant/load-more";
import { listActivity } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Activity · Admin · Acroma" };

type Props = { searchParams: Promise<{ cursor?: string }> };

export default async function AdminActivityPage({ searchParams }: Props) {
  const { cursor } = await searchParams;
  const page = await listActivity({ cursor });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-heading text-2xl font-medium">Admin activity</h1>
        <p className="text-sm text-muted-foreground">
          What super admins did, newest first.
        </p>
      </header>
      <ActivityTable items={page.items} />
      <LoadMore basePath="/admin/activity" params={{ cursor }} nextCursor={page.nextCursor} />
    </div>
  );
}
