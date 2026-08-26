import Link from "next/link";
import type { Metadata } from "next";
import { Plus, Megaphone } from "lucide-react";
import { listBroadcasts } from "@/lib/api/broadcasts";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { BroadcastRow } from "@/components/broadcasts/broadcast-row";
import { redirectStaffToOrders } from "@/lib/api/owner-only";

export const metadata: Metadata = { title: "Broadcasts · Acroma" };

export default async function BroadcastsPage() {
  await redirectStaffToOrders();

  const broadcasts = await listBroadcasts();
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        title="Broadcasts"
        description="Send a WhatsApp message to a group of customers."
        actions={
          <Button asChild size="sm" className="h-9 gap-1.5">
            <Link href="/dashboard/broadcasts/new">
              <Plus className="size-4" />
              New broadcast
            </Link>
          </Button>
        }
      />

      {broadcasts.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No broadcasts yet."
          description="Create one to announce a promo or an update to your customers."
          action={
            <Button asChild className="gap-1.5">
              <Link href="/dashboard/broadcasts/new">
                <Plus className="size-4" />
                New broadcast
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {broadcasts.map((b) => (
            <BroadcastRow key={b.id} broadcast={b} />
          ))}
        </div>
      )}
    </div>
  );
}
