"use client";

import { io, type Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_ACROMA_SOCKET_URL;

let socket: Socket | null = null;
let connecting: Promise<Socket> | null = null;

/**
 * Returns a singleton Socket.IO client connected to the Acroma backend
 * and joined to the current business room.
 *
 * Auth flow:
 *   1. Fetch a short-lived access token from /api/auth/socket-token
 *      (which reads our HTTP-only cookie server-side).
 *   2. Open the socket with `auth: { token }`.
 *   3. Emit `join` with the business id so the server adds us to the
 *      `business:<id>` room.
 *
 * Re-call `getSocket()` after login/logout to rebind. `disconnectSocket()`
 * tears the connection down on logout.
 */
export async function getSocket(businessId: string): Promise<Socket> {
  if (socket?.connected) return socket;
  if (connecting) return connecting;

  if (!SOCKET_URL) {
    throw new Error("NEXT_PUBLIC_ACROMA_SOCKET_URL is not set");
  }

  connecting = (async () => {
    const res = await fetch("/api/auth/socket-token", {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Not authenticated");
    const { accessToken } = (await res.json()) as { accessToken: string };

    const next = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ["websocket"],
      autoConnect: true,
    });

    await new Promise<void>((resolve, reject) => {
      next.once("connect", () => resolve());
      next.once("connect_error", (err) => reject(err));
    });

    next.emit("join", { businessId });
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
