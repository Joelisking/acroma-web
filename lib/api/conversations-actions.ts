"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "./server";
import type { Conversation, HandoffAction, Message } from "./types";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function replyAction(
  conversationId: string,
  content: string,
): Promise<ActionResult<Message>> {
  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "Message can't be empty" };

  try {
    const message = await apiFetch<Message>(
      `/conversations/${conversationId}/reply`,
      { method: "POST", body: { content: trimmed } },
    );
    revalidatePath(`/dashboard/conversations/${conversationId}`);
    revalidatePath("/dashboard/conversations");
    return { ok: true, data: message };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't send reply") };
  }
}

export async function handoffAction(
  conversationId: string,
  action: HandoffAction,
): Promise<ActionResult> {
  try {
    await apiFetch<unknown>(`/conversations/${conversationId}/handoff`, {
      method: "POST",
      body: { action },
    });
    revalidatePath(`/dashboard/conversations/${conversationId}`);
    revalidatePath("/dashboard/conversations");
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: humanError(err, "Handoff failed") };
  }
}

/**
 * Mark a conversation as RESOLVED — the "stop reminding me" action.
 * Clears `pendingOwnerSince`, the escalation reason, and reminder counters
 * on the backend; the cron stops ticking on this conversation.
 */
export async function markConversationResolvedAction(
  conversationId: string,
): Promise<ActionResult<Conversation>> {
  try {
    const conversation = await apiFetch<Conversation>(
      `/conversations/${conversationId}/resolve`,
      { method: "POST" },
    );
    revalidatePath(`/dashboard/conversations/${conversationId}`);
    revalidatePath("/dashboard/conversations");
    revalidatePath("/dashboard");
    return { ok: true, data: conversation };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't mark as resolved") };
  }
}

function humanError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
