"use client";

import * as React from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BusinessType, Order } from "@/lib/api/types";
import { groupByDay, utcDayKey } from "@/lib/orders/group-bookings";
import { BookingCard } from "./booking-card";

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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {days.map((day) => {
          const key = utcDayKey(day.toISOString());
          const bookings = byDay.get(key) ?? [];
          return (
            <div key={key} className="space-y-2">
              <div className="border-border/60 border-b pb-1">
                <p className="text-foreground text-sm font-medium">
                  {format(day, "EEE")}
                </p>
                <p className="text-muted-foreground text-xs">
                  {format(day, "d MMM")}
                </p>
              </div>
              {bookings.length === 0 ? (
                <p className="text-muted-foreground/70 text-xs">No bookings</p>
              ) : (
                bookings.map((o) => (
                  <BookingCard
                    key={o.id}
                    order={o}
                    businessType={businessType}
                  />
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
