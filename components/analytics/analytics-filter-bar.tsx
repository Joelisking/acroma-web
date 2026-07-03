"use client";

import { CalendarDays } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomRangePicker } from "@/components/dashboard/custom-range-picker";
import { ANALYTICS_RANGE_OPTIONS } from "@/lib/dashboard-filter";
import type { AnalyticsFilter, DashboardRange } from "@/lib/api/types";

type Props = {
  filter: AnalyticsFilter;
  onChange: (filter: AnalyticsFilter) => void;
};

export function AnalyticsFilterBar({ filter, onChange }: Props) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Analytics filters"
    >
      <Select
        value={filter.range}
        onValueChange={(v) =>
          onChange({ ...filter, range: v as DashboardRange })
        }
      >
        <SelectTrigger
          size="sm"
          className="bg-card w-[160px] gap-2 font-medium"
          aria-label="Time range"
        >
          <CalendarDays className="text-muted-foreground size-4" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ANALYTICS_RANGE_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {filter.range === "CUSTOM" ? (
        <CustomRangePicker
          startDate={filter.startDate}
          endDate={filter.endDate}
          onApply={(startDate, endDate) =>
            onChange({ ...filter, startDate, endDate })
          }
        />
      ) : null}
    </div>
  );
}
