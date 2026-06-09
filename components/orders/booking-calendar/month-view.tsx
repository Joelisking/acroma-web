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
      {/*
        Keep the shadcn calendar's default sizing model (a DEFINITE --cell-size
        drives both width and the aspect-square height). Forcing a fluid
        full-width broke this on WebKit/iOS (aspect-ratio with an indefinite
        width collapses the cell height, so the grid overflowed the day panel).
        Instead we just scale --cell-size up: ~1/8 of the viewport on phones so
        it fills the width, a fixed size from sm up. The value stays a concrete
        length, so heights resolve in every browser.
      */}
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
        className="mx-auto [--cell-size:12vw] sm:[--cell-size:2.5rem] lg:mx-0 lg:shrink-0"
      />
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
