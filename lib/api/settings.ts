import "server-only";

import { apiFetch } from "./server";

export type WhatsappSettings = {
  whatsappPhoneNumberId: string | null;
  whatsappBusinessAccountId: string | null;
  whatsappVerifyToken: string | null;
  whatsappWebhookActive: boolean;
  webhookUrl: string;
};

export type PaystackSettings = {
  publicKey: string | null;
  secretKeyMasked: string | null;
};

export async function getWhatsappSettings(): Promise<WhatsappSettings> {
  return apiFetch<WhatsappSettings>("/settings/whatsapp");
}

export async function getPaystackSettings(): Promise<PaystackSettings> {
  return apiFetch<PaystackSettings>("/settings/paystack");
}
