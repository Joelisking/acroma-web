import { formatMoney, formatPhone } from "@/lib/format";
import type {
  DashboardActivityConversation,
  DashboardActivityOrder,
} from "@/lib/api/types";

export type ActivityItem = {
  kind: "conversation" | "order";
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  href: string;
};

export function buildActivity(
  conversations: DashboardActivityConversation[],
  orders: DashboardActivityOrder[],
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
    title: `New order, ${formatMoney(o.totalAmount, o.currency)}`,
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

function conversationLabel(status: DashboardActivityConversation["status"]): string {
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

function orderLabel(status: DashboardActivityOrder["status"]): string {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "PAYMENT_PENDING":
      return "Awaiting payment";
    case "PAID":
      return "Paid";
    case "PROCESSING":
      return "Processing";
    case "PREPARING":
      return "Preparing";
    case "READY_FOR_PICKUP":
      return "Ready for pickup";
    case "SHIPPED":
      return "Shipped";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    case "NO_SHOW":
      return "No-show";
    case "PAYMENT_FAILED":
      return "Payment failed";
  }
}

/**
 * Split the recent-activity conversations into the single most-urgent one the
 * owner must answer (the "Needs you" hero) and the set the AI is currently
 * handling. The hero is the first WAITING_FOR_OWNER conversation; the handling
 * list is the AI_HANDLING conversations, excluding the hero.
 */
export function selectHomeConversations(
  conversations: DashboardActivityConversation[],
): {
  needsYou: DashboardActivityConversation | null;
  handling: DashboardActivityConversation[];
} {
  const needsYou =
    conversations.find((c) => c.status === "WAITING_FOR_OWNER") ?? null;
  const handling = conversations.filter(
    (c) => c.status === "AI_HANDLING" && c.id !== needsYou?.id,
  );
  return { needsYou, handling };
}
