import Link from "next/link";
import { ChevronLeft, Phone } from "lucide-react";
import type { Order } from "@/lib/api/types";
import { OrderStatusBadge } from "./order-status-badge";
import { PaymentMethodBadge } from "./payment-method-badge";
import { FulfillmentBadge } from "./fulfillment-badge";
import { DiscountBadge } from "./discount-badge";
import { formatMoney, formatPhone, shortId } from "@/lib/format";

export function OrderHeader({ order }: { order: Order }) {
  const customer = order.customerName?.trim();

  return (
    <header className="flex flex-col gap-4">
      <Link
        href="/dashboard/orders"
        className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1 text-xs font-medium"
      >
        <ChevronLeft className="size-4" />
        All orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-muted-foreground text-xs tracking-wider uppercase">
            Order #{shortId(order.id)}
          </p>
          <h1 className="font-display text-foreground mt-2 text-3xl font-medium tracking-tight tabular-nums sm:text-4xl">
            {formatMoney(order.totalAmount, order.currency)}
          </h1>
          <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-3 text-sm">
            {customer ? (
              <span className="text-foreground font-medium">{customer}</span>
            ) : null}
            <a
              href={`tel:${order.customerPhone}`}
              className="hover:text-foreground inline-flex items-center gap-1.5"
            >
              <Phone className="size-3.5" />
              {formatPhone(order.customerPhone)}
            </a>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <OrderStatusBadge status={order.status} size="md" />
          <FulfillmentBadge fulfillment={order.fulfillment} />
          <PaymentMethodBadge method={order.paymentMethod} />
          {order.discount ? (
            <DiscountBadge
              discount={order.discount}
              discountAmount={order.discountAmount}
              currency={order.currency}
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}
