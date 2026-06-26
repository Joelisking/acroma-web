"use client";

import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerCombobox } from "./customer-combobox";
import type {
  ConversationStatus,
  DashboardFilter,
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

/** How many of the secondary (non-range) filters are active. */
export function countActiveFilters(filter: DashboardFilter): number {
  return [
    filter.orderStatus,
    filter.conversationStatus,
    filter.customerSegment,
    filter.customerPhone,
  ].filter(Boolean).length;
}

type Props = {
  filter: DashboardFilter;
  onChange: (filter: DashboardFilter) => void;
};

/**
 * The secondary dashboard filters (order status, conversation, customer
 * segment, specific customer). Shared between the desktop popover and the
 * mobile bottom sheet so both stay in sync.
 */
export function DashboardFilterPanel({ filter, onChange }: Props) {
  const active = countActiveFilters(filter);

  const clear = () =>
    onChange({
      ...filter,
      orderStatus: undefined,
      conversationStatus: undefined,
      customerSegment: undefined,
      customerPhone: undefined,
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold tracking-tight">Filter results</p>
        {active > 0 ? (
          <button
            type="button"
            onClick={clear}
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
              customerSegment: v === ANY ? undefined : (v as "NEW" | "RETURNING"),
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
