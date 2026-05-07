import "server-only";

import { apiFetch } from "./server";

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
