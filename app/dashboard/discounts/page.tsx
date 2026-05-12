import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { listDiscounts } from "@/lib/api/discounts";
import { getCurrentBusiness } from "@/lib/api/business";
import { Button } from "@/components/ui/button";
import { DiscountRow } from "@/components/discounts/discount-row";

export const metadata: Metadata = { title: "Discounts · Acroma" };

export default async function DiscountsPage() {
  const [business, discounts] = await Promise.all([
    getCurrentBusiness(),
    listDiscounts(true),
  ]);
  if (!business) return null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted-foreground">Promos</p>
          <h1 className="font-display text-foreground mt-1 text-3xl font-medium tracking-tight">
            Discount codes
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Give customers a code to type in WhatsApp for a discount on their order.
          </p>
        </div>
        <Button asChild className="gap-1.5">
          <Link href="/dashboard/discounts/new">
            <Plus className="size-4" />
            New code
          </Link>
        </Button>
      </header>

      {discounts.length === 0 ? (
        <div className="border-border/70 bg-card rounded-2xl border p-8 text-center">
          <p className="text-foreground text-sm font-medium">No codes yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Create your first promo code and share it with customers.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {discounts.map((d) => (
            <DiscountRow key={d.id} discount={d} currency={business.currency} />
          ))}
        </div>
      )}
    </div>
  );
}
