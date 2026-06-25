import Link from "next/link";
import type { Metadata } from "next";
import { Plus, Ticket } from "lucide-react";
import { listDiscounts } from "@/lib/api/discounts";
import { getCurrentBusiness } from "@/lib/api/business";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DiscountRow } from "@/components/discounts/discount-row";

export const metadata: Metadata = { title: "Discounts · Acroma" };

export default async function DiscountsPage() {
  const [business, discounts] = await Promise.all([
    getCurrentBusiness(),
    listDiscounts(true),
  ]);
  if (!business) return null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        title="Discount codes"
        description="Give customers a code to type in WhatsApp for a discount on their order."
        actions={
          <Button asChild size="sm" className="h-9 gap-1.5">
            <Link href="/dashboard/discounts/new">
              <Plus className="size-4" />
              New code
            </Link>
          </Button>
        }
      />

      {discounts.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No codes yet."
          description="Create your first promo code and share it with customers."
          action={
            <Button asChild className="gap-1.5">
              <Link href="/dashboard/discounts/new">
                <Plus className="size-4" />
                New code
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {discounts.map((d) => (
            <DiscountRow key={d.id} discount={d} currency={business.currency} />
          ))}
        </div>
      )}
    </div>
  );
}
