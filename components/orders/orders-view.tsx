"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CalendarDays, List, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  BusinessType,
  Order,
  OrdersView as ViewPref,
} from "@/lib/api/types";
import { OrdersList } from "./orders-list";
import { OrdersEmpty } from "./orders-empty";
import { BookingCalendar } from "./booking-calendar/booking-calendar";
import { setOrdersViewAction } from "@/lib/api/settings-actions";

type Mode = "month" | "week";

export function OrdersView({
  orders,
  businessType,
  view,
  mode,
  focusedDate,
}: {
  orders: Order[];
  businessType?: BusinessType | null;
  view: "list" | "calendar";
  mode: Mode;
  focusedDate: Date;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [savingDefault, startSave] = React.useTransition();

  function setParam(updates: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) next.set(k, v);
    router.push(`/dashboard/orders?${next.toString()}`);
  }

  function saveDefault() {
    const pref: ViewPref = view === "calendar" ? "CALENDAR" : "LIST";
    startSave(async () => {
      const result = await setOrdersViewAction(pref);
      if (!result.ok) toast.error(result.error);
      else toast.success(`Default set to ${view}`);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="bg-muted inline-flex rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setParam({ view: "list" })}
            className={
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm transition-colors " +
              (view === "list"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground")
            }
          >
            <List className="size-4" /> List
          </button>
          <button
            type="button"
            onClick={() => setParam({ view: "calendar" })}
            className={
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm transition-colors " +
              (view === "calendar"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground")
            }
          >
            <CalendarDays className="size-4" /> Calendar
          </button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={saveDefault}
          disabled={savingDefault}
          className="gap-1.5"
        >
          <Pin className="size-3.5" /> Set as default
        </Button>
      </div>

      {view === "calendar" ? (
        <BookingCalendar
          orders={orders}
          mode={mode}
          focusedDate={focusedDate}
          businessType={businessType}
          onDateChange={(d) =>
            setParam({ date: d.toISOString().slice(0, 10) })
          }
          onModeChange={(m) => setParam({ mode: m })}
        />
      ) : orders.length === 0 ? (
        <OrdersEmpty filtered={false} />
      ) : (
        <OrdersList orders={orders} businessType={businessType} />
      )}
    </div>
  );
}
