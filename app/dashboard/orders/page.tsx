import type { Metadata } from "next";
import { cookies } from "next/headers";
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
import { HOME_COOKIE } from "@/lib/home-preference";
import { PageHeader } from "@/components/shared/page-header";
import { HomePreferenceToggle } from "@/components/dashboard/home-preference-toggle";
import { OrdersBoard } from "@/components/orders/orders-board";
import { OrdersView } from "@/components/orders/orders-view";
import { LiveRefresh } from "@/components/conversations/live-refresh";

export const metadata: Metadata = { title: "Orders · Acroma" };

type PageProps = {
  searchParams: Promise<{
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
  const homeIsOrders =
    (await cookies()).get(HOME_COOKIE)?.value === "orders";

  // Services can flip between a calendar and a list; everything else runs the
  // operating board. The view falls back to the merchant's saved default.
  const view: "list" | "calendar" = !isServices
    ? "list"
    : sp.view === "calendar" || sp.view === "list"
      ? sp.view
      : business.ordersDefaultView === "CALENDAR"
        ? "calendar"
        : "list";
  const mode: "month" | "week" = sp.mode === "week" ? "week" : "month";
  // Noon UTC so a date-only value lands on the same calendar day in every
  // device timezone, and so the calendar key stays day-granular across socket
  // refreshes (a millisecond-precise default would remount and snap to today).
  const dateKey = sp.date ?? new Date().toISOString().slice(0, 10);
  const focusedDate = new Date(`${dateKey}T12:00:00Z`);

  // Calendar fetches the visible range (± 1 week padding). The board and the
  // services list both load the full set and group it client-side.
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
    orders = await listOrders({ from: from.toISOString(), to: to.toISOString() });
  } else {
    orders = await listOrders({});
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        title={vocab.orders}
        description={
          isServices
            ? "Manage every booking from request to showed-up."
            : "Your live board, from new order to delivered."
        }
        actions={<HomePreferenceToggle surface="orders" isHome={homeIsOrders} />}
      />

      {isServices ? (
        <OrdersView
          orders={orders}
          businessType={business.businessType}
          view={view}
          mode={mode}
          focusedDate={focusedDate}
        />
      ) : (
        <OrdersBoard orders={orders} businessType={business.businessType} />
      )}

      <LiveRefresh
        businessId={business.id}
        events={["order_updated", "new_message"]}
      />
    </div>
  );
}
