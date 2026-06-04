import type { Metadata } from "next";
import { listOrders } from "@/lib/api/orders";
import { getCurrentBusiness } from "@/lib/api/business";
import type { OrderStatus } from "@/lib/api/types";
import { OrderRow } from "@/components/orders/order-row";
import { OrderStatusFilter } from "@/components/orders/order-status-filter";
import { OrdersEmpty } from "@/components/orders/orders-empty";
import { LiveRefresh } from "@/components/conversations/live-refresh";

export const metadata: Metadata = { title: "Orders · Acroma" };

const VALID_STATUSES: OrderStatus[] = [
  "PENDING",
  "PAYMENT_PENDING",
  "PAID",
  "PROCESSING",
  "PREPARING",
  "READY_FOR_PICKUP",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "PAYMENT_FAILED",
];

type PageProps = { searchParams: Promise<{ status?: string }> };

export default async function OrdersPage({ searchParams }: PageProps) {
  const { status: rawStatus } = await searchParams;
  const status = VALID_STATUSES.includes(rawStatus as OrderStatus)
    ? (rawStatus as OrderStatus)
    : undefined;

  const [business, orders] = await Promise.all([
    getCurrentBusiness(),
    listOrders(status),
  ]);
  if (!business) return null;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-muted-foreground">Inbox</p>
          <h1 className="font-display text-foreground mt-1 text-3xl font-medium tracking-tight">
            Orders
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Track every order from confirmed to delivered.
          </p>
        </div>
        <OrderStatusFilter />
      </header>

      {orders.length === 0 ? (
        <OrdersEmpty filtered={status !== undefined} />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              businessType={business.businessType}
            />
          ))}
        </div>
      )}

      <LiveRefresh
        businessId={business.id}
        events={["order_updated", "new_message"]}
      />
    </div>
  );
}
