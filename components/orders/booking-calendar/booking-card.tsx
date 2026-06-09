"use client";

import Link from "next/link";
import { CalendarClock, AlertCircle } from "lucide-react";
import type { BusinessType, Order } from "@/lib/api/types";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderStatusControl } from "@/components/orders/order-status-control";
import { formatItemsSummary, formatPhone, shortId } from "@/lib/format";
import { formatAppointment } from "@/lib/format-datetime";

function isPast(iso: string) {
  return new Date(iso).getTime() < Date.now();
}

export function BookingCard({
  order,
  businessType,
}: {
  order: Order;
  businessType?: BusinessType | null;
}) {
  const customer =
    order.customerName?.trim() || formatPhone(order.customerPhone);
  const needsReview =
    !!order.scheduledFor &&
    isPast(order.scheduledFor) &&
    (order.status === "PENDING" || order.status === "PROCESSING");

  return (
    <div className="card-warm space-y-2 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/dashboard/orders/${order.id}`}
            className="text-foreground hover:text-brand-orange text-sm font-medium"
          >
            {customer}
          </Link>
          {order.scheduledFor ? (
            <span className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
              <CalendarClock className="size-3.5" />
              {formatAppointment(order.scheduledFor)}
            </span>
          ) : null}
          <p className="text-muted-foreground mt-0.5 truncate text-xs">
            {formatItemsSummary(order.items)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} businessType={businessType} />
      </div>

      {needsReview ? (
        <p className="text-brand-orange flex items-center gap-1 text-xs whitespace-nowrap">
          <AlertCircle className="size-3.5 shrink-0" /> Did they show?
        </p>
      ) : null}

      <OrderStatusControl
        orderId={order.id}
        status={order.status}
        paymentMethod={order.paymentMethod}
        businessType={businessType}
        totalAmount={order.totalAmount}
        currency={order.currency}
      />
      <span className="sr-only">Booking {shortId(order.id)}</span>
    </div>
  );
}
