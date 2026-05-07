"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAcromaSocket } from "@/hooks/use-acroma-socket";

type LiveRefreshProps = {
  businessId: string;
  /** Events that should trigger a router refresh. */
  events?: string[];
};

/**
 * Invisible client-side island that subscribes to socket events and
 * triggers `router.refresh()` to re-fetch the surrounding Server Components.
 *
 * Coalesces bursts of events into a single refresh per ~250ms window.
 */
export function LiveRefresh({
  businessId,
  events = ["new_message", "conversation_updated"],
}: LiveRefreshProps) {
  const router = useRouter();
  const timeoutRef = React.useRef<number | null>(null);

  const handlers = React.useMemo(() => {
    const debouncedRefresh = () => {
      if (timeoutRef.current !== null) return;
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        router.refresh();
      }, 250);
    };
    return Object.fromEntries(events.map((e) => [e, debouncedRefresh]));
  }, [events, router]);

  useAcromaSocket(businessId, handlers);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return null;
}
