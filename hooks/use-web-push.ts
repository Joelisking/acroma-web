"use client";

import * as React from "react";
import {
  subscribeWebPushAction,
  unsubscribeWebPushAction,
  type WebPushSubscriptionInput,
} from "@/lib/api/web-push-actions";
import { useClientValue } from "./use-client-value";

const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function detectSupport(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    Boolean(VAPID_KEY)
  );
}

function readPermission(): NotificationPermission {
  return typeof Notification !== "undefined"
    ? Notification.permission
    : "default";
}

export type WebPushState = {
  /** Browser supports push AND a VAPID key is configured. */
  supported: boolean;
  /** Current Notification permission, or "default" before we know. */
  permission: NotificationPermission;
  subscribed: boolean;
  busy: boolean;
  enable: () => Promise<{ ok: boolean; error?: string }>;
  disable: () => Promise<void>;
};

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  // Back the array with a concrete ArrayBuffer so it satisfies BufferSource.
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

function toInput(sub: PushSubscription): WebPushSubscriptionInput | null {
  const json = sub.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return null;
  return {
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
    userAgent: navigator.userAgent,
  };
}

/**
 * Owns the browser side of Web Push: service-worker registration, the
 * permission prompt, and (un)subscribing — syncing the subscription to the
 * backend so it can deliver order/escalation notifications.
 */
export function useWebPush(): WebPushState {
  // Browser-derived values: read via useSyncExternalStore (SSR-safe, and
  // avoids setState-in-effect). `subscribed`/`busy` re-render on change, which
  // re-reads `permission` so a fresh grant/denial is reflected.
  const supported = useClientValue(detectSupport, false);
  const permission = useClientValue<NotificationPermission>(
    readPermission,
    "default",
  );
  const [subscribed, setSubscribed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!supported) return;
    void (async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        const existing = await reg.pushManager.getSubscription();
        setSubscribed(Boolean(existing));
        // Quietly refresh lastSeenAt so the backend knows this device is live.
        if (existing) {
          const input = toInput(existing);
          if (input) void subscribeWebPushAction(input);
        }
      } catch {
        // Registration can fail (e.g. unsupported context) — leave disabled.
      }
    })();
  }, [supported]);

  const enable = React.useCallback(async () => {
    if (!supported) return { ok: false, error: "Not supported on this device" };
    setBusy(true);
    try {
      const result = await Notification.requestPermission();
      if (result !== "granted") {
        return { ok: false, error: "Notifications were not allowed" };
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_KEY!),
      });
      const input = toInput(sub);
      if (!input) {
        await sub.unsubscribe();
        return { ok: false, error: "Couldn't read the subscription" };
      }
      const res = await subscribeWebPushAction(input);
      if (!res.ok) {
        await sub.unsubscribe();
        return { ok: false, error: res.error };
      }
      setSubscribed(true);
      return { ok: true };
    } catch {
      return { ok: false, error: "Couldn't enable notifications" };
    } finally {
      setBusy(false);
    }
  }, [supported]);

  const disable = React.useCallback(async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await unsubscribeWebPushAction(endpoint);
      }
      setSubscribed(false);
    } catch {
      // best-effort
    } finally {
      setBusy(false);
    }
  }, []);

  return { supported, permission, subscribed, busy, enable, disable };
}
