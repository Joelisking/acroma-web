import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDiscount } from "@/lib/api/discounts";
import { ApiError } from "@/lib/api/server";
import { DiscountForm } from "@/components/discounts/discount-form";
import { redirectStaffHome } from "@/lib/api/owner-only";

type PageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Discount · Acroma" };

export default async function DiscountDetailPage({ params }: PageProps) {
  await redirectStaffHome();

  const { id } = await params;
  let discount;
  try {
    discount = await getDiscount(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
          Promos
        </p>
        <h1 className="text-foreground mt-1 text-3xl font-bold tracking-tight">
          {discount.code}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Used {discount.usageCount}
          {discount.totalUsageLimit !== null ? ` of ${discount.totalUsageLimit}` : ""} times.
        </p>
      </header>
      <DiscountForm mode="edit" existing={discount} />
    </div>
  );
}
