import type { Metadata } from "next";
import { DiscountForm } from "@/components/discounts/discount-form";

export const metadata: Metadata = { title: "New discount · Acroma" };

export default function NewDiscountPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="eyebrow text-muted-foreground">Promos</p>
        <h1 className="font-display text-foreground mt-1 text-3xl font-medium tracking-tight">
          New discount code
        </h1>
      </header>
      <DiscountForm mode="create" />
    </div>
  );
}
