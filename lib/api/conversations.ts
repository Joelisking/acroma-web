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
    const { count } = await apiFetch<{ count: number }>(
      "/conversations/unread-count",
    );
    return count;
  } catch {
    return 0;
  }
}

export async function getConversation(
  id: string,
): Promise<ConversationWithMessages> {
  return apiFetch<ConversationWithMessages>(`/conversations/${id}`);
}
