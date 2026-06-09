"use client";

import * as React from "react";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BusinessType, Order } from "@/lib/api/types";
import { groupByDay, localDayKey } from "@/lib/orders/group-bookings";
import { BookingCard } from "./booking-card";

function DayColumn({
  day,
  bookings,
  businessType,
}: {
  day: Date;
  bookings: Order[];
  businessType?: BusinessType | null;
}) {
  return (
    <div className="space-y-2">
      <div className="border-border/60 border-b pb-1">
        <p className="text-foreground text-sm font-medium">
          {format(day, "EEE")}
        </p>
        <p className="text-muted-foreground text-xs">{format(day, "d MMM")}</p>
      </div>
      {bookings.length === 0 ? (
        <p className="text-muted-foreground/70 text-xs">No bookings</p>
      ) : (
        bookings.map((o) => (
          <BookingCard key={o.id} order={o} businessType={businessType} />
        ))
      )}
    </div>
  );
}

export function WeekView({
  orders,
  focusedDate,
  businessType,
  onWeekChange,
}: {
  orders: Order[];
  focusedDate: Date;
  businessType?: BusinessType | null;
  onWeekChange: (date: Date) => void;
}) {
  const byDay = React.useMemo(() => groupByDay(orders), [orders]);
  const weekStart = startOfWeek(focusedDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const [selectedDay, setSelectedDay] = React.useState<Date>(focusedDate);

  const bookingsFor = (d: Date) => byDay.get(localDayKey(d)) ?? [];
  const selectedBookings = bookingsFor(selectedDay);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onWeekChange(addDays(focusedDate, -7))}
          aria-label="Previous week"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-foreground text-sm font-medium">
          Week of {format(weekStart, "d MMM yyyy")}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onWeekChange(addDays(focusedDate, 7))}
          aria-label="Next week"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Desktop: the whole week side by side. */}
      <div className="hidden gap-3 lg:grid lg:grid-cols-7">
        {days.map((day) => (
          <DayColumn
            key={localDayKey(day)}
            day={day}
            bookings={bookingsFor(day)}
            businessType={businessType}
          />
        ))}
      </div>

      {/* Mobile: a compact day strip + the selected day's agenda. */}
      <div className="space-y-3 lg:hidden">
        <div className="flex gap-1">
          {days.map((day) => {
            const count = bookingsFor(day).length;
            const active = isSameDay(day, selectedDay);
            return (
              <button
                key={localDayKey(day)}
                type="button"
                onClick={() => setSelectedDay(day)}
                aria-label={`${format(day, "EEEE d MMM")}, ${count} booking${count === 1 ? "" : "s"}`}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 text-xs transition-colors",
                  active
                    ? "bg-brand-orange text-white"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <span>{format(day, "EEEEE")}</span>
                <span className="text-sm font-medium">{format(day, "d")}</span>
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    count === 0
                      ? "bg-transparent"
                      : active
                        ? "bg-white"
                        : "bg-brand-orange",
                  )}
                />
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            {format(selectedDay, "EEEE d MMM")},{" "}
            {selectedBookings.length === 0
              ? "no bookings"
              : `${selectedBookings.length} booking${selectedBookings.length === 1 ? "" : "s"}`}
          </p>
          {selectedBookings.map((o) => (
            <BookingCard key={o.id} order={o} businessType={businessType} />
          ))}
        </div>
      </div>
    </div>
  );
}
