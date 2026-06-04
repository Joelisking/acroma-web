import Link from "next/link";
import { Phone, MapPin, Package } from "lucide-react";
import type { BusinessType, Order } from "@/lib/api/types";
import { OrderStatusBadge } from "./order-status-badge";
import { CopyButton } from "@/components/ui/copy-button";
import {
  formatItemsSummary,
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
  const itemsSummary = formatItemsSummary(order.items);
  const isDelivery = order.fulfillment === "DELIVERY";
  const hasAddress = isDelivery && Boolean(order.deliveryAddress);

  return (
    <div className="card-warm hover:border-brand-orange/30 relative p-4 transition-colors">
      {/* Stretched overlay link: clicking anywhere on the card opens the order,
          while the phone link and copy buttons below sit above it via z-10. */}
      <Link
        href={`/dashboard/orders/${order.id}`}
        aria-label={`Open order #${shortId(order.id)} for ${customer}`}
        className="focus-visible:ring-ring absolute inset-0 rounded-[inherit] focus-visible:ring-2 focus-visible:outline-none"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-mono text-[0.7rem] tracking-wider">
              #{shortId(order.id)}
            </span>
            <OrderStatusBadge status={order.status} businessType={businessType} />
          </div>
          <p className="text-foreground mt-1.5 truncate text-sm font-semibold">
            {customer}
          </p>
          {itemsSummary ? (
            <p className="text-muted-foreground mt-1 truncate text-xs">
              {itemsSummary}
            </p>
          ) : null}
          <p className="text-muted-foreground mt-0.5 text-xs">
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
          <a
            href={`tel:${order.customerPhone}`}
            className="text-foreground hover:text-brand-orange relative z-10 text-xs font-medium tabular-nums"
          >
            {formatPhone(order.customerPhone)}
          </a>
          <CopyButton
            value={order.customerPhone}
            label="Copy phone number"
            className="relative z-10 ml-auto"
          />
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
          {hasAddress ? (
            <CopyButton
              value={order.deliveryAddress as string}
              label="Copy delivery address"
              className="relative z-10 ml-auto"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
