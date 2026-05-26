import "server-only";

import { apiFetch } from "./server";
import type {
  Conversation,
  ConversationStatus,
  ConversationWithMessages,
} from "./types";

/**
 * Server-side reads for the conversations resource.
 * Mutations live in `./conversations-actions.ts` (Server Actions).
 */

export async function listConversations(
  status?: ConversationStatus,
): Promise<Conversation[]> {
  const qs = status ? `?status=${status}` : "";
  return apiFetch<Conversation[]>(`/conversations${qs}`);
}

/** Count conversations with customer messages the owner hasn't opened yet. */
export async function countUnreadConversations(): Promise<number> {
  try {
    const { count } = await apiFetch<{ count: number; waiting: number }>(
      "/conversations/unread-count",
    );
    return count;
  } catch {
    return 0;
  }
}

/**
 * Conversation badge counts for the dashboard shell. Backend bundles both
 * onto `/conversations/unread-count` so the shell renders with one round trip.
 *   - unread: new customer messages the merchant hasn't opened.
 *   - waiting: conversations with `pendingOwnerSince` set, i.e. the merchant
 *     still owes a personal reply (survives AI auto-takeover).
 */
export async function getConversationBadgeCounts(): Promise<{
  unread: number;
  waiting: number;
}> {
  try {
    const { count, waiting } = await apiFetch<{
      count: number;
      waiting: number;
    }>("/conversations/unread-count");
    return { unread: count ?? 0, waiting: waiting ?? 0 };
  } catch {
    return { unread: 0, waiting: 0 };
  }
}

export async function getConversation(
  id: string,
): Promise<ConversationWithMessages> {
  return apiFetch<ConversationWithMessages>(`/conversations/${id}`);
}
