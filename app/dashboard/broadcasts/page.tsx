import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { listBroadcasts } from "@/lib/api/broadcasts";
import { Button } from "@/components/ui/button";
import { BroadcastRow } from "@/components/broadcasts/broadcast-row";

export const metadata: Metadata = { title: "Broadcasts · Acroma" };

export default async function BroadcastsPage() {
  const broadcasts = await listBroadcasts();
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted-foreground">Outreach</p>
          <h1 className="font-display text-foreground mt-1 text-3xl font-medium tracking-tight">
            Broadcasts
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Send a WhatsApp message to a group of customers.
          </p>
        </div>
        <Button asChild className="gap-1.5">
          <Link href="/dashboard/broadcasts/new">
            <Plus className="size-4" />
            New broadcast
          </Link>
        </Button>
      </header>

      {broadcasts.length === 0 ? (
        <div className="border-border/70 bg-card rounded-2xl border p-8 text-center">
          <p className="text-foreground text-sm font-medium">No broadcasts yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Create one to announce a promo or update.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {broadcasts.map((b) => (
            <BroadcastRow key={b.id} broadcast={b} />
          ))}
        </div>
      )}
    </div>
  );
}
