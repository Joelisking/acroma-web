import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Order } from "@/lib/api/types";
import { OrderStatusBadge } from "./order-status-badge";
import {
  formatMoney,
  formatPhone,
  formatRelativeShort,
  shortId,
} from "@/lib/format";

export function OrderRow({ order }: { order: Order }) {
  const customer =
    order.customerName?.trim() || formatPhone(order.customerPhone);
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <Link
      href={`/dashboard/orders/${order.id}`}
      className="group/row hover:bg-accent/50 focus-visible:bg-accent/50 border-border/60 flex items-center gap-3 border-b px-4 py-4 transition-colors last:border-b-0 focus-visible:outline-none"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-muted-foreground text-[0.7rem] tracking-wider">
            #{shortId(order.id)}
          </span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-muted-foreground text-xs tabular-nums">
            {formatRelativeShort(order.createdAt)}
          </span>
        </div>
        <p className="text-foreground mt-1 truncate text-sm font-medium">
          {customer}
        </p>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {itemCount} {itemCount === 1 ? "item" : "items"}
          {order.fulfillment === "PICKUP" ? " · Pickup" : null}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <span className="font-display text-foreground text-lg font-medium tabular-nums">
          {formatMoney(order.totalAmount, order.currency)}
        </span>
        <OrderStatusBadge status={order.status} />
      </div>

      <ChevronRight
        className="text-muted-foreground/60 group-hover/row:text-foreground size-4 shrink-0 transition-colors"
        aria-hidden
      />
    </Link>
  );
}
