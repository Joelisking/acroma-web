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

/** Count conversations the AI has escalated to the owner. */
export async function countUrgentConversations(): Promise<number> {
  try {
    const list = await listConversations("WAITING_FOR_OWNER");
    return list.length;
  } catch {
    return 0;
  }
}

export async function getConversation(
  id: string,
): Promise<ConversationWithMessages> {
  return apiFetch<ConversationWithMessages>(`/conversations/${id}`);
}
