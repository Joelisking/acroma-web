"use client";

import { useEffect } from "react";
import { unstable_isUnrecognizedActionError } from "next/navigation";

const LAST_RELOAD_KEY = "acroma:stale-deploy-reload";
// A reload that lands back here within this window means the fresh document
// is somehow still stale (cached HTML, a deploy mid-flight). Stop looping and
// let the boundary render its normal fallback instead.
const LOOP_WINDOW_MS = 10_000;

/**
 * A tab or installed PWA left open across a deploy still holds the previous
 * build's Server Action ids. Next answers the next action call with a 404 and
 * the client throws `UnrecognizedActionError`, which no `reset()` can fix —
 * only a fresh document carries the new ids. So we reload, once.
 *
 * Call from an `error.tsx` boundary. Returns true while the reload is on its
 * way so the boundary can show a neutral line instead of its failure copy.
 */
export function useStaleDeployReload(error: unknown): boolean {
  const stale = unstable_isUnrecognizedActionError(error);

  useEffect(() => {
    if (!stale) return;
    try {
      const last = Number(sessionStorage.getItem(LAST_RELOAD_KEY) ?? 0);
      if (Date.now() - last < LOOP_WINDOW_MS) return;
      sessionStorage.setItem(LAST_RELOAD_KEY, String(Date.now()));
    } catch {
      // Storage blocked (private mode, PWA quirks) — still reload once.
    }
    window.location.reload();
  }, [stale]);

  return stale;
}
