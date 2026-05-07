import { formatMoney, formatPhone } from "@/lib/format";
import type { Conversation, Order } from "@/lib/api/types";

export type ActivityItem = {
  kind: "conversation" | "order";
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  href: string;
};

/** Statuses where money has hit the merchant's account. */
const REVENUE_STATUSES = new Set<Order["status"]>([
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
]);

/**
 * West Africa is at or near UTC, so anchoring "today" to UTC midnight is a
 * sane proxy for the merchant's local day. Refine if we add merchant TZ.
 */
export function startOfTodayUtc(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function computeTodayMetrics(
  conversations: Conversation[],
  orders: Order[],
  todayStart: Date,
): { conversations: number; orders: number; revenue: number } {
  const t = todayStart.getTime();
  const todayConvs = conversations.filter(
    (c) => new Date(c.createdAt).getTime() >= t,
  );
  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt).getTime() >= t,
  );
  const revenue = todayOrders
    .filter((o) => REVENUE_STATUSES.has(o.status))
    .reduce((sum, o) => sum + o.totalAmount, 0);
  return {
    conversations: todayConvs.length,
    orders: todayOrders.length,
    revenue,
  };
}

export function buildActivity(
  conversations: Conversation[],
  orders: Order[],
): ActivityItem[] {
  const fromConvs: ActivityItem[] = conversations.map((c) => ({
    kind: "conversation",
    id: c.id,
    title: c.customerName || formatPhone(c.customerPhone),
    subtitle: conversationLabel(c.status),
    timestamp: c.lastMessageAt,
    href: `/dashboard/conversations/${c.id}`,
  }));
  const fromOrders: ActivityItem[] = orders.map((o) => ({
    kind: "order",
    id: o.id,
    title: `New order — ${formatMoney(o.totalAmount, o.currency)}`,
    subtitle: `${
      o.customerName || formatPhone(o.customerPhone)
    } · ${orderLabel(o.status)}`,
    timestamp: o.createdAt,
    href: `/dashboard/orders/${o.id}`,
  }));
  return [...fromConvs, ...fromOrders].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

function conversationLabel(status: Conversation["status"]): string {
  switch (status) {
    case "AI_HANDLING":
      return "AI replying";
    case "WAITING_FOR_OWNER":
      return "Needs you";
    case "WITH_OWNER":
      return "You're handling it";
    case "RESOLVED":
      return "Resolved";
  }
}

function orderLabel(status: Order["status"]): string {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "PAYMENT_PENDING":
      return "Awaiting payment";
    case "PAID":
      return "Paid";
    case "PROCESSING":
      return "Processing";
    case "SHIPPED":
      return "Shipped";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    case "PAYMENT_FAILED":
      return "Payment failed";
  }
}
