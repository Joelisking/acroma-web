"use client";

import { io, type Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_ACROMA_SOCKET_URL;

let socket: Socket | null = null;
let connecting: Promise<Socket> | null = null;

/** Fetch the current access token for a Socket.IO handshake. */
async function fetchAccessToken(): Promise<string> {
  const res = await fetch("/api/auth/socket-token", {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Not authenticated");
  const { accessToken } = (await res.json()) as { accessToken: string };
  return accessToken;
}

/**
 * Returns a singleton Socket.IO client connected to the Acroma backend
 * and joined to the current business room.
 *
 * Auth flow:
 *   1. `auth` is a callback, so socket.io runs it before EVERY (re)connect
 *      attempt — each reconnect picks up a fresh, unexpired access token
 *      instead of reusing the one captured at first connect.
 *   2. On every `connect` we re-emit `join`. socket.io transparently
 *      reconnects after a drop (backend restart, network blip, idle), but
 *      the server places the reconnected socket in NO rooms — it only joins
 *      on an explicit `join` emit. Without re-emitting, live updates stop
 *      silently after the first disconnect until a full page reload.
 *
 * Re-call `getSocket()` after login/logout to rebind. `disconnectSocket()`
 * tears the connection down on logout.
 */
export async function getSocket(businessId: string): Promise<Socket> {
  // Reuse an existing socket even while it is mid-reconnect — socket.io
  // handles reconnection internally and bound handlers survive. Creating a
  // second `io()` here would leak a duplicate connection.
  if (socket) return socket;
  if (connecting) return connecting;

  if (!SOCKET_URL) {
    throw new Error("NEXT_PUBLIC_ACROMA_SOCKET_URL is not set");
  }

  connecting = (async () => {
    const next = io(SOCKET_URL, {
      auth: (cb) => {
        fetchAccessToken()
          .then((token) => cb({ token }))
          .catch(() => cb({ token: "" }));
      },
      transports: ["websocket"],
      autoConnect: true,
    });

    next.on("connect", () => {
      next.emit("join", { businessId });
    });

    await new Promise<void>((resolve, reject) => {
      next.once("connect", () => resolve());
      next.once("connect_error", (err) => reject(err));
    });

    socket = next;
    return next;
  })();

  try {
    return await connecting;
  } finally {
    connecting = null;
  }
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
