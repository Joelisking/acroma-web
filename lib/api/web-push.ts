"use server";

import { apiFetch, ApiError } from "./server";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * Public — fetched once at the auth-gated dashboard root, cached client-side
 * inside the subscriber. Returns `null` if VAPID isn't configured server-side.
 */
export async function getVapidPublicKey(): Promise<string | null> {
  try {
    const data = await apiFetch<{ publicKey: string | null }>(
      "/business/vapid-public-key",
      { auth: false },
    );
    return data.publicKey;
  } catch {
    return null;
  }
}

export type WebPushSubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function saveWebPushSubscriptionAction(
  subscription: WebPushSubscriptionInput,
): Promise<ActionResult> {
  try {
    await apiFetch<{ success: boolean }>(
      "/business/me/web-push-subscription",
      { method: "POST", body: subscription },
    );
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't subscribe") };
  }
}

export async function clearWebPushSubscriptionAction(): Promise<ActionResult> {
  try {
    await apiFetch<{ success: boolean }>(
      "/business/me/web-push-subscription",
      { method: "DELETE" },
    );
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't unsubscribe") };
  }
}

function humanError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
