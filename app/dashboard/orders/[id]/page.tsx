import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getOrder } from "@/lib/api/orders";
import { getCurrentBusiness } from "@/lib/api/business";
import { ApiError } from "@/lib/api/server";
import { OrderHeader } from "@/components/orders/order-header";
import { OrderItems } from "@/components/orders/order-items";
import { OrderStatusStepper } from "@/components/orders/order-status-stepper";
import { OrderStatusControl } from "@/components/orders/order-status-control";
import { PaymentLinkPanel } from "@/components/orders/payment-link-panel";
import { DeliveryAddressCard } from "@/components/orders/delivery-address-card";
import { LiveRefresh } from "@/components/conversations/live-refresh";

type PageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Order · Acroma" };

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [business, order] = await Promise.all([
    getCurrentBusiness(),
    safeGetOrder(id),
  ]);
  if (!business) return null;
  if (!order) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <OrderHeader order={order} />

      <section
        className="border-border/70 bg-card rounded-2xl border p-6"
        aria-label="Order progress"
      >
        <p className="eyebrow text-muted-foreground">Progress</p>
        <div className="mt-5">
          <OrderStatusStepper status={order.status} />
        </div>
        <div className="mt-6">
          <OrderStatusControl
                orderId={order.id}
                status={order.status}
                paymentMethod={order.paymentMethod}
              />
        </div>
      </section>

      <PaymentLinkPanel order={order} />

      <DeliveryAddressCard
        orderId={order.id}
        status={order.status}
        deliveryAddress={order.deliveryAddress}
      />

      <section aria-label="Items" className="space-y-3">
        <h2 className="text-foreground text-sm font-semibold">Items</h2>
        <OrderItems items={order.items} currency={order.currency} />
      </section>

      {order.notes ? (
        <section
          className="border-border/70 bg-card rounded-2xl border p-5"
          aria-label="Notes"
        >
          <p className="eyebrow text-muted-foreground">Notes</p>
          <p className="text-foreground mt-2 text-sm leading-relaxed whitespace-pre-wrap">
            {order.notes}
          </p>
        </section>
      ) : null}

      <LiveRefresh businessId={business.id} events={["order_updated"]} />
    </div>
  );
}

async function safeGetOrder(id: string) {
  try {
    return await getOrder(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
