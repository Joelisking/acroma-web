import { notFound, redirect } from "next/navigation";

import { getOrder } from "@/lib/api/orders";
import { listConversations } from "@/lib/api/conversations";
import { ApiError } from "@/lib/api/server";

type PageProps = { params: Promise<{ id: string }> };

/** Digits-only, so a "+233…" order phone still matches a "233…" conversation. */
function phoneKey(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Resolver for the "Open chat" button on an order. Orders and conversations
 * are linked only by customer phone (unique per business), so there's no
 * conversation id on the order payload to link straight to. This server route
 * resolves the order's customer to their conversation on click and redirects
 * there — deferring the lookup to intent rather than paying it on every board
 * render. Falls back to the conversations list if the customer has no thread
 * yet (e.g. a manually created order).
 */
export default async function OrderChatRedirectPage({ params }: PageProps) {
  const { id } = await params;

  let order;
  try {
    order = await getOrder(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const conversations = await listConversations();
  const target = phoneKey(order.customerPhone);
  const conversation = conversations.find(
    (c) => phoneKey(c.customerPhone) === target,
  );

  redirect(
    conversation
      ? `/dashboard/conversations/${conversation.id}`
      : "/dashboard/conversations",
  );
}
