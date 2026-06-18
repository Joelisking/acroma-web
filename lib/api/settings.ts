import "server-only";

import { apiFetch } from "./server";
import type { BookingCapacitySettings, ReminderSettings } from "./types";

export type WhatsappSettings = {
  whatsappPhoneNumberId: string | null;
  whatsappBusinessAccountId: string | null;
  whatsappVerifyToken: string | null;
  whatsappWebhookActive: boolean;
  // Token health. `whatsappHealthy` is false once a probe (or a failed send)
  // finds the access token dead; `whatsappLastError` is the reason to surface.
  whatsappHealthy: boolean;
  whatsappTokenExpiresAt: string | null;
  whatsappLastError: string | null;
  webhookUrl: string;
};

export async function getWhatsappSettings(): Promise<WhatsappSettings> {
  return apiFetch<WhatsappSettings>("/settings/whatsapp");
}

export async function getReminderSettings(): Promise<ReminderSettings> {
  return apiFetch<ReminderSettings>("/settings/reminders");
}

export async function getBookingCapacity(): Promise<BookingCapacitySettings> {
  return apiFetch<BookingCapacitySettings>("/settings/booking-capacity");
}
