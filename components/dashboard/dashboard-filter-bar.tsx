"use client";

import { CalendarDays, SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CustomRangePicker } from "./custom-range-picker";
import {
  DashboardFilterPanel,
  countActiveFilters,
} from "./dashboard-filter-panel";
import { RANGE_OPTIONS, canCompare, compareHint } from "@/lib/dashboard-filter";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import type { DashboardFilter, DashboardRange } from "@/lib/api/types";

type Props = {
  filter: DashboardFilter;
  onChange: (filter: DashboardFilter) => void;
  onSaveDefault: () => void;
  saving: boolean;
  isDefault: boolean;
};

export function DashboardFilterBar({
  filter,
  onChange,
  onSaveDefault,
  saving,
  isDefault,
}: Props) {
  const isWide = useMediaQuery("(min-width: 768px)");
  const activeCount = countActiveFilters(filter);

  const filtersTrigger = (
    <Button variant="outline" size="sm" className="bg-card gap-2" aria-label="More filters">
      <SlidersHorizontal className="size-4" />
      Filters
      {activeCount > 0 ? (
        <span className="bg-brand-orange text-primary-foreground ml-0.5 inline-flex size-5 items-center justify-center rounded-full text-[0.7rem] font-bold tabular-nums">
          {activeCount}
        </span>
      ) : null}
    </Button>
  );

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Dashboard filters"
    >
      {/* Primary: time range */}
      <Select
        value={filter.range}
        onValueChange={(v) => onChange({ ...filter, range: v as DashboardRange })}
      >
        <SelectTrigger
          size="sm"
          className="bg-card w-[150px] gap-2 font-medium"
          aria-label="Date range"
        >
          <CalendarDays className="text-muted-foreground size-4" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {RANGE_OPTIONS.map((o) => (
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

      {/* Secondary filters: popover on desktop, bottom sheet on mobile */}
      {isWide ? (
        <Popover>
          <PopoverTrigger asChild>{filtersTrigger}</PopoverTrigger>
          <PopoverContent align="start" className="w-72 p-4">
            <DashboardFilterPanel filter={filter} onChange={onChange} />
          </PopoverContent>
        </Popover>
      ) : (
        <Sheet>
          <SheetTrigger asChild>{filtersTrigger}</SheetTrigger>
          <SheetContent
            side="bottom"
            className="max-h-[85vh] overflow-y-auto rounded-t-3xl px-5 pt-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]"
          >
            <SheetTitle className="sr-only">Filter results</SheetTitle>
            <DashboardFilterPanel filter={filter} onChange={onChange} />
          </SheetContent>
        </Sheet>
      )}

      {/* Compare + save default — own row on mobile, pushed right from sm up */}
      <div className="flex w-full items-center gap-3 sm:ml-auto sm:w-auto">
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <div className="flex items-center gap-2">
              <Switch
                id="dashboard-compare"
                checked={Boolean(filter.compare) && canCompare(filter)}
                disabled={!canCompare(filter)}
                onCheckedChange={(compare) => onChange({ ...filter, compare })}
                aria-label="Compare to previous period"
              />
              <TooltipTrigger asChild>
                <label
                  htmlFor="dashboard-compare"
                  className="text-muted-foreground cursor-pointer text-sm font-medium"
                >
                  Compare
                </label>
              </TooltipTrigger>
            </div>
            <TooltipContent>{compareHint(filter)}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button
          variant="ghost"
          size="sm"
          className={cn("text-muted-foreground", isDefault && "opacity-60")}
          disabled={saving || isDefault}
          onClick={onSaveDefault}
        >
          {isDefault ? "Saved" : saving ? "Saving…" : "Save as default"}
        </Button>
      </div>
    </div>
  );
}
