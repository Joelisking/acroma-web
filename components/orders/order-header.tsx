import Link from "next/link";
import { ChevronLeft, Phone } from "lucide-react";
import type { BusinessType, Order } from "@/lib/api/types";
import { OrderStatusBadge } from "./order-status-badge";
import { PaymentMethodBadge } from "./payment-method-badge";
import { FulfillmentBadge } from "./fulfillment-badge";
import { DiscountBadge } from "./discount-badge";
import { CopyButton } from "@/components/ui/copy-button";
import {
  formatItemsSummary,
  formatMoney,
  formatPhone,
  shortId,
} from "@/lib/format";

export function OrderHeader({
  order,
  businessType,
}: {
  order: Order;
  businessType?: BusinessType | null;
}) {
  const customer = order.customerName?.trim();
  const itemsSummary = formatItemsSummary(order.items);
  const isServices = businessType === "SERVICES";

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
          <h1 className="text-foreground mt-2 text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
            {formatMoney(order.totalAmount, order.currency)}
          </h1>
          <div className="text-muted-foreground mt-3 flex flex-col gap-1.5 text-sm">
            {customer ? (
              <span className="text-foreground font-medium">{customer}</span>
            ) : null}
            {itemsSummary ? <span>{itemsSummary}</span> : null}
            <span className="inline-flex items-center gap-1">
              <a
                href={`tel:${order.customerPhone}`}
                className="hover:text-foreground inline-flex items-center gap-1.5"
              >
                <Phone className="size-3.5" />
                {formatPhone(order.customerPhone)}
              </a>
              <CopyButton
                value={order.customerPhone}
                label="Copy phone number"
                className="-my-1"
              />
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <OrderStatusBadge
            status={order.status}
            businessType={businessType}
            fulfillment={order.fulfillment}
            size="md"
          />
          {/* In-person appointments have no pickup/delivery choice. */}
          {isServices ? null : (
            <FulfillmentBadge fulfillment={order.fulfillment} />
          )}
          <PaymentMethodBadge
            method={order.paymentMethod}
            businessType={businessType}
          />
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
