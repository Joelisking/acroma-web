import type { Metadata } from "next";
import { listTemplates } from "@/lib/api/templates";
import { listDiscounts } from "@/lib/api/discounts";
import { BroadcastComposer } from "@/components/broadcasts/broadcast-composer";

export const metadata: Metadata = { title: "New broadcast · Acroma" };

export default async function NewBroadcastPage() {
  const [templates, discounts] = await Promise.all([
    listTemplates(),
    listDiscounts(false), // active only
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="eyebrow text-muted-foreground">Outreach</p>
        <h1 className="font-display text-foreground mt-1 text-3xl font-medium tracking-tight">
          New broadcast
        </h1>
      </header>
      <BroadcastComposer templates={templates} discounts={discounts} />
    </div>
  );
}
