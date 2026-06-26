"use client";

import * as React from "react";

/**
 * SSR-safe media query hook built on useSyncExternalStore: returns false during
 * server render / first paint, then the real match. Used to pick a presentation
 * by viewport (e.g. side panel vs bottom sheet) without a layout flash.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
