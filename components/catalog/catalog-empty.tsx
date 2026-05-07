import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CatalogEmpty() {
  return (
    <div className="border-border/70 bg-card/60 flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
      <span className="bg-brand-orange-soft text-brand-orange flex size-14 items-center justify-center rounded-2xl text-2xl">
        ✨
      </span>
      <p className="font-display text-foreground mt-5 text-2xl font-medium tracking-tight">
        Your catalog is empty.
      </p>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
        Add your first product so Acroma can answer questions, take orders, and
        update stock automatically.
      </p>
      <Button
        asChild
        className="bg-brand-orange hover:bg-brand-orange/90 mt-6 h-11 gap-2 rounded-xl px-5"
      >
        <Link href="/dashboard/catalog/new">
          <Plus />
          Add product
        </Link>
      </Button>
    </div>
  );
}
