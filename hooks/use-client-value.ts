"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Read a browser-only value (e.g. feature detection, `Notification.permission`)
 * safely across SSR and hydration. Returns `serverValue` on the server and
 * during hydration, then the live client value. Avoids `setState`-in-effect.
 *
 * `getSnapshot` must return a primitive (or referentially stable value) so
 * React's snapshot comparison doesn't loop.
 */
export function useClientValue<T>(getSnapshot: () => T, serverValue: T): T {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverValue);
}
