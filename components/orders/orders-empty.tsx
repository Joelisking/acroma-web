import { ShoppingBag } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export function OrdersEmpty({ filtered = false }: { filtered?: boolean }) {
  if (filtered) {
    return (
      <EmptyState
        icon={ShoppingBag}
        tone="muted"
        title="Nothing matches that filter."
        description="Try a different status, or clear the filter to see everything."
      />
    );
  }
  return (
    <EmptyState
      icon={ShoppingBag}
      title="No orders yet."
      description="Once Acroma confirms an order in WhatsApp, it shows up here in real time."
    />
  );
}
