import type { Metadata } from "next";
import { DiscountForm } from "@/components/discounts/discount-form";
import { redirectStaffHome } from "@/lib/api/owner-only";

export const metadata: Metadata = { title: "New discount · Acroma" };

export default async function NewDiscountPage() {
  await redirectStaffHome();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
          Promos
        </p>
        <h1 className="text-foreground mt-1 text-3xl font-bold tracking-tight">
          New discount code
        </h1>
      </header>
      <DiscountForm mode="create" />
    </div>
  );
}
