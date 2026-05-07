"use client";

/**
 * Browser-side Web Push helpers. Wraps the Notification + ServiceWorker +
 * PushManager APIs into a small, predictable surface.
 */

export type SupportLevel = "supported" | "no-sw" | "no-push" | "no-notif";

export function checkSupport(): SupportLevel {
  if (typeof window === "undefined") return "no-sw";
  if (!("serviceWorker" in navigator)) return "no-sw";
  if (!("PushManager" in window)) return "no-push";
  if (!("Notification" in window)) return "no-notif";
  return "supported";
}

export async function ensureRegistration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration("/sw.js");
  if (existing) return existing;
  return navigator.serviceWorker.register("/sw.js");
}

export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (checkSupport() !== "supported") return null;
  const reg = await ensureRegistration();
  return reg.pushManager.getSubscription();
}

export async function subscribe(
  vapidPublicKey: string,
): Promise<PushSubscription> {
  const reg = await ensureRegistration();
  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing;
  return reg.pushManager.subscribe({
    userVisibleOnly: true,
    // Cast to BufferSource — Push API accepts a Uint8Array but the TS lib
    // narrows the buffer type strictly.
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      .buffer as ArrayBuffer,
  });
}

export async function unsubscribe(): Promise<void> {
  const sub = await getCurrentSubscription();
  if (sub) await sub.unsubscribe();
}

export function serializeSubscription(sub: PushSubscription) {
  const json = sub.toJSON() as {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error("Subscription is missing required fields");
  }
  return {
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
  };
}

/** VAPID keys are base64url; the Push API needs a Uint8Array. */
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalised = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalised);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
