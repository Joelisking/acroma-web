"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import type { BusinessType, Order } from "@/lib/api/types";
import { bookedDays, groupByDay, utcDayKey } from "@/lib/orders/group-bookings";
import { BookingCard } from "./booking-card";

function utcMidnight(d: Date) {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

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
  const [selected, setSelected] = React.useState<Date>(focusedDate);
  const booked = React.useMemo(() => bookedDays(orders), [orders]);
  const byDay = React.useMemo(() => groupByDay(orders), [orders]);

  const selectedKey = utcDayKey(selected.toISOString());
  const dayBookings = byDay.get(selectedKey) ?? [];

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <Calendar
        mode="single"
        month={focusedDate}
        onMonthChange={onMonthChange}
        selected={selected}
        onSelect={(d) => d && setSelected(utcMidnight(d))}
        modifiers={{ booked }}
        modifiersClassNames={{
          booked:
            "relative after:absolute after:bottom-1 after:left-1/2 after:size-1.5 after:-translate-x-1/2 after:rounded-full after:bg-brand-orange",
        }}
        className="shrink-0"
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
