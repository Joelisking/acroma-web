"use client";

import { Button } from "@/components/ui/button";
import type { BusinessType, Order } from "@/lib/api/types";
import { splitScheduled } from "@/lib/orders/group-bookings";
import { MonthView } from "./month-view";
import { WeekView } from "./week-view";
import { BookingCard } from "./booking-card";

type Mode = "month" | "week";

export function BookingCalendar({
  orders,
  mode,
  focusedDate,
  businessType,
  onDateChange,
  onModeChange,
}: {
  orders: Order[];
  mode: Mode;
  focusedDate: Date;
  businessType?: BusinessType | null;
  onDateChange: (date: Date) => void;
  onModeChange: (mode: Mode) => void;
}) {
  const { unscheduled } = splitScheduled(orders);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="bg-muted inline-flex rounded-lg p-0.5">
          {(["month", "week"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onModeChange(m)}
              className={
                "rounded-md px-3 py-1 text-sm capitalize transition-colors " +
                (mode === m
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground")
              }
            >
              {m}
            </button>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDateChange(new Date())}
        >
          Today
        </Button>
      </div>

      {mode === "month" ? (
        <MonthView
          key={focusedDate.getTime()}
          orders={orders}
          focusedDate={focusedDate}
          businessType={businessType}
          onMonthChange={onDateChange}
        />
      ) : (
        <WeekView
          key={focusedDate.getTime()}
          orders={orders}
          focusedDate={focusedDate}
          businessType={businessType}
          onWeekChange={onDateChange}
        />
      )}

      {unscheduled.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-muted-foreground text-sm font-medium">
            Unscheduled
          </h2>
          {unscheduled.map((o) => (
            <BookingCard key={o.id} order={o} businessType={businessType} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
