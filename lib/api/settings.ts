import "server-only";

import { apiFetch } from "./server";
import type { ReminderSettings } from "./types";

export type WhatsappSettings = {
  whatsappPhoneNumberId: string | null;
  whatsappBusinessAccountId: string | null;
  whatsappVerifyToken: string | null;
  whatsappWebhookActive: boolean;
  webhookUrl: string;
};

export async function getWhatsappSettings(): Promise<WhatsappSettings> {
  return apiFetch<WhatsappSettings>("/settings/whatsapp");
}

export async function getReminderSettings(): Promise<ReminderSettings> {
  return apiFetch<ReminderSettings>("/settings/reminders");
}
