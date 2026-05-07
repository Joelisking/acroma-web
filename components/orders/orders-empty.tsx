import { ShoppingBag } from "lucide-react";

export function OrdersEmpty({ filtered = false }: { filtered?: boolean }) {
  return (
    <div className="border-border/70 bg-card/60 flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
      <span className="bg-brand-orange-soft text-brand-orange flex size-14 items-center justify-center rounded-2xl">
        <ShoppingBag className="size-6" strokeWidth={1.75} />
      </span>
      <p className="font-display text-foreground mt-5 text-2xl font-medium tracking-tight">
        {filtered ? "Nothing matches that filter." : "No orders yet."}
      </p>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
        {filtered
          ? "Try a different status or clear the filter to see everything."
          : "Once Acroma confirms an order in WhatsApp, it'll show up here in real time."}
      </p>
    </div>
  );
}
