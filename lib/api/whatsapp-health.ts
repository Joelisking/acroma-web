import "server-only"

import { readRole } from "./cookies"
import { getWhatsappSettings } from "./settings"

/**
 * Why the dashboard should nag the owner to reconnect WhatsApp, or null when
 * it shouldn't: no number connected, connection healthy, or a staff session
 * (staff can't reconnect). The reason is the health check's own message.
 * A failed settings read returns null; the banner must never break the shell.
 */
export async function getReconnectNotice(): Promise<{
  reason: string | null
} | null> {
  try {
    const [role, s] = await Promise.all([readRole(), getWhatsappSettings()])
    if (role === "STAFF") return null
    const connected =
      !!s.whatsappPhoneNumberId || s.connection?.status === "CONNECTED"
    return connected && !s.whatsappHealthy
      ? { reason: s.whatsappLastError }
      : null
  } catch {
    return null
  }
}
