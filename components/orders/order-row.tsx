import Link from "next/link";
import { Phone, MapPin, Package } from "lucide-react";
import type { BusinessType, Order } from "@/lib/api/types";
import { OrderStatusBadge } from "./order-status-badge";
import {
  formatMoney,
  formatPhone,
  formatRelativeShort,
  shortId,
} from "@/lib/format";

export function OrderRow({
  order,
  businessType,
}: {
  order: Order;
  businessType?: BusinessType | null;
}) {
  const customer =
    order.customerName?.trim() || formatPhone(order.customerPhone);
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
  const isDelivery = order.fulfillment === "DELIVERY";

  return (
    <Link
      href={`/dashboard/orders/${order.id}`}
      className="card-warm hover:border-brand-orange/30 focus-visible:ring-ring block p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-muted-foreground text-[0.7rem] tracking-wider">
              #{shortId(order.id)}
            </span>
            <OrderStatusBadge status={order.status} businessType={businessType} />
          </div>
          <p className="text-foreground mt-1.5 truncate text-sm font-semibold">
            {customer}
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {itemCount} {itemCount === 1 ? "item" : "items"} ·{" "}
            {isDelivery ? "Delivery" : "Pickup"} ·{" "}
            {formatRelativeShort(order.createdAt)}
          </p>
        </div>
        <span className="font-display text-foreground shrink-0 text-lg font-medium tabular-nums">
          {formatMoney(order.totalAmount, order.currency)}
        </span>
      </div>

      <div className="bg-muted mt-3 flex flex-col gap-2 rounded-xl p-3">
        <div className="flex items-center gap-2.5">
          <span className="bg-brand-orange-soft text-brand-orange flex size-7 shrink-0 items-center justify-center rounded-lg">
            <Phone className="size-3.5" />
          </span>
          <span className="text-foreground text-xs font-medium tabular-nums">
            {formatPhone(order.customerPhone)}
          </span>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="bg-brand-blue-soft text-brand-blue flex size-7 shrink-0 items-center justify-center rounded-lg">
            {isDelivery ? (
              <MapPin className="size-3.5" />
            ) : (
              <Package className="size-3.5" />
            )}
          </span>
          <p className="text-foreground min-w-0 text-xs leading-snug font-medium">
            {isDelivery
              ? order.deliveryAddress || "Address to confirm"
              : "Customer pickup"}
          </p>
        </div>
      </div>
    </Link>
  );
}
