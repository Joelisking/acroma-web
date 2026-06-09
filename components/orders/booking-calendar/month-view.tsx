"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import type { BusinessType, Order } from "@/lib/api/types";
import {
  bookedDays,
  groupByDay,
  localDayKey,
} from "@/lib/orders/group-bookings";
import { BookingCard } from "./booking-card";

export function MonthView({
  orders,
  focusedDate,
  businessType,
  onMonthChange,
}: {
  orders: Order[];
  focusedDate: Date;
  businessType?: BusinessType | null;
  onMonthChange: (date: Date) => void;
}) {
  // `selected` initialises from `focusedDate`. The parent remounts this view
  // (via a key on the focused month) when the month changes, so the selected
  // day moves with it and the day panel never shows a stale month.
  const [selected, setSelected] = React.useState<Date>(focusedDate);
  const booked = React.useMemo(() => bookedDays(orders), [orders]);
  const byDay = React.useMemo(() => groupByDay(orders), [orders]);

  const dayBookings = byDay.get(localDayKey(selected)) ?? [];

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="w-full lg:max-w-sm lg:shrink-0">
        <Calendar
          mode="single"
          month={focusedDate}
          onMonthChange={onMonthChange}
          selected={selected}
          onSelect={(d) => d && setSelected(d)}
          modifiers={{ booked }}
          modifiersClassNames={{
            booked:
              "relative after:absolute after:bottom-1 after:left-1/2 after:size-1.5 after:-translate-x-1/2 after:rounded-full after:bg-brand-orange",
          }}
          classNames={{
            root: "w-full",
            // The shadcn default day cell is `aspect-square h-full w-full`; the
            // h-full collapses to ~0 height when the calendar is forced full
            // width, so the grid overflows onto the day panel. Drop h-full and
            // let aspect-square set the height.
            day: "group/day relative aspect-square w-full rounded-md p-0 text-center select-none [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
          }}
          className="w-full"
        />
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <p className="text-muted-foreground text-sm">
          {dayBookings.length === 0
            ? "No bookings on this day."
            : `${dayBookings.length} booking${dayBookings.length === 1 ? "" : "s"}`}
        </p>
        {dayBookings.map((o) => (
          <BookingCard key={o.id} order={o} businessType={businessType} />
        ))}
      </div>
    </div>
  );
}
