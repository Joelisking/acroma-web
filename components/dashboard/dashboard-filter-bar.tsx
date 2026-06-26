"use client";

import { CalendarDays, SlidersHorizontal, X } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CustomerCombobox } from "./customer-combobox";
import { CustomRangePicker } from "./custom-range-picker";
import { RANGE_OPTIONS, canCompare, compareHint } from "@/lib/dashboard-filter";
import { cn } from "@/lib/utils";
import type {
  ConversationStatus,
  DashboardFilter,
  DashboardRange,
  OrderStatus,
} from "@/lib/api/types";

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PAYMENT_PENDING",
  "PAID",
  "PROCESSING",
  "PREPARING",
  "READY_FOR_PICKUP",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "PAYMENT_FAILED",
];

const CONVERSATION_STATUSES: ConversationStatus[] = [
  "AI_HANDLING",
  "WAITING_FOR_OWNER",
  "WITH_OWNER",
  "RESOLVED",
];

const ANY = "__ANY__";

const titleCase = (s: string) =>
  s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

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
  const activeCount = [
    filter.orderStatus,
    filter.conversationStatus,
    filter.customerSegment,
    filter.customerPhone,
  ].filter(Boolean).length;

  const clearSecondary = () =>
    onChange({
      ...filter,
      orderStatus: undefined,
      conversationStatus: undefined,
      customerSegment: undefined,
      customerPhone: undefined,
    });

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

      {/* Secondary filters behind a popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-card gap-2"
            aria-label="More filters"
          >
            <SlidersHorizontal className="size-4" />
            Filters
            {activeCount > 0 ? (
              <span className="bg-brand-orange text-primary-foreground ml-0.5 inline-flex size-5 items-center justify-center rounded-full text-[0.7rem] font-bold tabular-nums">
                {activeCount}
              </span>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 space-y-4 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold tracking-tight">Filter results</p>
            {activeCount > 0 ? (
              <button
                type="button"
                onClick={clearSecondary}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs font-medium"
              >
                <X className="size-3" />
                Clear
              </button>
            ) : null}
          </div>

          <FilterField label="Order status">
            <Select
              value={filter.orderStatus ?? ANY}
              onValueChange={(v) =>
                onChange({
                  ...filter,
                  orderStatus: v === ANY ? undefined : (v as OrderStatus),
                })
              }
            >
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>Any order status</SelectItem>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {titleCase(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Conversation">
            <Select
              value={filter.conversationStatus ?? ANY}
              onValueChange={(v) =>
                onChange({
                  ...filter,
                  conversationStatus:
                    v === ANY ? undefined : (v as ConversationStatus),
                })
              }
            >
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>Any conversation</SelectItem>
                {CONVERSATION_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {titleCase(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Customers">
            <Select
              value={filter.customerSegment ?? ANY}
              onValueChange={(v) =>
                onChange({
                  ...filter,
                  customerSegment:
                    v === ANY ? undefined : (v as "NEW" | "RETURNING"),
                })
              }
            >
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>All customers</SelectItem>
                <SelectItem value="NEW">New customers</SelectItem>
                <SelectItem value="RETURNING">Returning</SelectItem>
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Specific customer">
            <CustomerCombobox
              value={filter.customerPhone}
              onChange={(customerPhone) => onChange({ ...filter, customerPhone })}
              className="w-full"
            />
          </FilterField>
        </PopoverContent>
      </Popover>

      {/* Compare + save default, pushed right */}
      <div className="ml-auto flex items-center gap-3">
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

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-muted-foreground text-xs font-semibold">{label}</p>
      {children}
    </div>
  );
}
