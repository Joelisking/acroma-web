"use client";

import * as React from "react";
import type { Socket } from "socket.io-client";
import { getSocket, disconnectSocket } from "@/lib/api/socket";

type EventHandlers = Record<string, (payload: unknown) => void>;

/**
 * Subscribe to Socket.IO events for the current business.
 *
 * Pass a stable `handlers` object (memoized or referentially stable) keyed
 * by event name. The hook opens the singleton socket, joins the business
 * room, and binds your handlers — unbinding on unmount.
 *
 * Use this in the smallest possible client island. The connection itself
 * is shared across mount points via the singleton in `lib/api/socket.ts`.
 */
export function useAcromaSocket(
  businessId: string | null,
  handlers: EventHandlers,
) {
  const handlersRef = React.useRef(handlers);
  React.useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  React.useEffect(() => {
    if (!businessId) return;
    let socket: Socket | null = null;
    let cancelled = false;

    const dispatchers: Record<string, (payload: unknown) => void> = {};

    void getSocket(businessId)
      .then((s) => {
        if (cancelled) return;
        socket = s;
        for (const event of Object.keys(handlersRef.current)) {
          const fn = (payload: unknown) => {
            handlersRef.current[event]?.(payload);
          };
          dispatchers[event] = fn;
          s.on(event, fn);
        }
      })
      .catch(() => {
        // Connection failure handled by the caller's UI; nothing to do here.
      });

    return () => {
      cancelled = true;
      if (socket) {
        for (const [event, fn] of Object.entries(dispatchers)) {
          socket.off(event, fn);
        }
      }
    };
  }, [businessId]);
}

export { disconnectSocket };
