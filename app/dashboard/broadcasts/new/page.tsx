import type { Metadata } from "next";
import { listTemplates } from "@/lib/api/templates";
import { listDiscounts } from "@/lib/api/discounts";
import { BroadcastComposer } from "@/components/broadcasts/broadcast-composer";
import { redirectStaffHome } from "@/lib/api/owner-only";

export const metadata: Metadata = { title: "New broadcast · Acroma" };

export default async function NewBroadcastPage() {
  await redirectStaffHome();

  const [templates, discounts] = await Promise.all([
    listTemplates(),
    listDiscounts(false), // active only
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
          Outreach
        </p>
        <h1 className="text-foreground mt-1 text-3xl font-bold tracking-tight">
          New broadcast
        </h1>
      </header>
      <BroadcastComposer templates={templates} discounts={discounts} />
    </div>
  );
}
