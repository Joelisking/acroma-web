"use server";

import { apiFetch, ApiError } from "./server";

type ActionResult = { ok: true } | { ok: false; error: string };

export type WebPushSubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string;
};

/** Persist a browser push subscription for the signed-in merchant. */
export async function subscribeWebPushAction(
  input: WebPushSubscriptionInput,
): Promise<ActionResult> {
  try {
    await apiFetch<void>("/notifications/web-push/subscribe", {
      method: "POST",
      body: input,
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't enable notifications" };
    }
    return { ok: false, error: "Couldn't enable notifications" };
  }
}

/** Remove a browser push subscription. */
export async function unsubscribeWebPushAction(
  endpoint: string,
): Promise<ActionResult> {
  try {
    await apiFetch<void>("/notifications/web-push/subscribe", {
      method: "DELETE",
      body: { endpoint },
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't disable notifications" };
    }
    return { ok: false, error: "Couldn't disable notifications" };
  }
}
