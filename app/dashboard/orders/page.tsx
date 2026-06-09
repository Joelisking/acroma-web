import type { Metadata } from "next";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subDays,
  addDays,
} from "date-fns";
import { listOrders } from "@/lib/api/orders";
import { getCurrentBusiness } from "@/lib/api/business";
import { getVocabulary } from "@/lib/vocabulary";
import type { OrderStatus } from "@/lib/api/types";
import { OrdersList } from "@/components/orders/orders-list";
import { OrderStatusFilter } from "@/components/orders/order-status-filter";
import { OrdersEmpty } from "@/components/orders/orders-empty";
import { OrdersView } from "@/components/orders/orders-view";
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
  "NO_SHOW",
  "PAYMENT_FAILED",
];

type PageProps = {
  searchParams: Promise<{
    status?: string;
    view?: string;
    mode?: string;
    date?: string;
  }>;
};

export default async function OrdersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const business = await getCurrentBusiness();
  if (!business) return null;

  const vocab = getVocabulary(business.businessType);
  const isServices = business.businessType === "SERVICES";

  // Resolve the view (services only). Falls back to the saved default.
  const view: "list" | "calendar" = !isServices
    ? "list"
    : sp.view === "calendar" || sp.view === "list"
      ? sp.view
      : business.ordersDefaultView === "CALENDAR"
        ? "calendar"
        : "list";
  const mode: "month" | "week" = sp.mode === "week" ? "week" : "month";
  // Noon UTC so a date-only value lands on the same calendar day in every
  // device timezone (avoids a midnight off-by-one in the calendar).
  const focusedDate = sp.date ? new Date(`${sp.date}T12:00:00Z`) : new Date();

  const status = VALID_STATUSES.includes(sp.status as OrderStatus)
    ? (sp.status as OrderStatus)
    : undefined;

  // Calendar fetches the visible range (± 1 week padding); list keeps status.
  let orders;
  if (isServices && view === "calendar") {
    const from =
      mode === "month"
        ? subDays(startOfMonth(focusedDate), 7)
        : subDays(startOfWeek(focusedDate, { weekStartsOn: 1 }), 7);
    const to =
      mode === "month"
        ? addDays(endOfMonth(focusedDate), 7)
        : addDays(endOfWeek(focusedDate, { weekStartsOn: 1 }), 7);
    orders = await listOrders({
      from: from.toISOString(),
      to: to.toISOString(),
    });
  } else {
    orders = await listOrders({ status });
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-muted-foreground">Inbox</p>
          <h1 className="font-display text-foreground mt-1 text-3xl font-medium tracking-tight">
            {vocab.orders}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isServices
              ? "Manage every booking from request to showed-up."
              : "Track every order from confirmed to delivered."}
          </p>
        </div>
        {isServices ? null : <OrderStatusFilter />}
      </header>

      {isServices ? (
        <OrdersView
          orders={orders}
          businessType={business.businessType}
          view={view}
          mode={mode}
          focusedDate={focusedDate}
        />
      ) : orders.length === 0 ? (
        <OrdersEmpty filtered={status !== undefined} />
      ) : (
        <OrdersList orders={orders} businessType={business.businessType} />
      )}

      <LiveRefresh
        businessId={business.id}
        events={["order_updated", "new_message"]}
      />
    </div>
  );
}
