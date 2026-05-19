"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { CustomerCombobox } from "./customer-combobox";
import { CustomRangePicker } from "./custom-range-picker";
import { RANGE_OPTIONS, canCompare } from "@/lib/dashboard-filter";
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
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Dashboard filters"
    >
      <Select
        value={filter.range}
        onValueChange={(v) =>
          onChange({ ...filter, range: v as DashboardRange })
        }
      >
        <SelectTrigger size="sm" className="w-[150px]" aria-label="Date range">
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

      <Select
        value={filter.orderStatus ?? ANY}
        onValueChange={(v) =>
          onChange({
            ...filter,
            orderStatus: v === ANY ? undefined : (v as OrderStatus),
          })
        }
      >
        <SelectTrigger size="sm" className="w-[150px]" aria-label="Order status filter">
          <SelectValue placeholder="Any order status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Any order status</SelectItem>
          {ORDER_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s.replace(/_/g, " ").toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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
        <SelectTrigger size="sm" className="w-[160px]" aria-label="Conversation status filter">
          <SelectValue placeholder="Any conversation" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Any conversation</SelectItem>
          {CONVERSATION_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s.replace(/_/g, " ").toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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
        <SelectTrigger size="sm" className="w-[140px]" aria-label="Customer segment filter">
          <SelectValue placeholder="All customers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>All customers</SelectItem>
          <SelectItem value="NEW">New customers</SelectItem>
          <SelectItem value="RETURNING">Returning</SelectItem>
        </SelectContent>
      </Select>

      <CustomerCombobox
        value={filter.customerPhone}
        onChange={(customerPhone) => onChange({ ...filter, customerPhone })}
      />

      <div className="flex items-center gap-2">
        <Switch
          id="dashboard-compare"
          checked={Boolean(filter.compare) && canCompare(filter)}
          disabled={!canCompare(filter)}
          onCheckedChange={(compare) => onChange({ ...filter, compare })}
          aria-label="Compare to previous period"
        />
        <label
          htmlFor="dashboard-compare"
          className="text-muted-foreground cursor-pointer text-sm"
        >
          Compare
        </label>
      </div>

      <Button
        variant="ghost"
        size="sm"
        disabled={saving || isDefault}
        onClick={onSaveDefault}
      >
        {isDefault ? "Default saved" : saving ? "Saving…" : "Set as default"}
      </Button>
    </div>
  );
}
