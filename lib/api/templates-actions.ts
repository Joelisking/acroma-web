"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "./server";
import type { WhatsappTemplate } from "./types";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * Register Acroma's counter payment-link template on the merchant's WABA.
 *
 * Meta reviews it, so the row usually comes back PENDING and the till keeps
 * falling back to the QR until the review clears.
 */
export async function createTillPaymentTemplateAction(): Promise<
  ActionResult<WhatsappTemplate>
> {
  try {
    const data = await apiFetch<WhatsappTemplate>(
      "/templates/till-payment-link",
      { method: "POST" }
    );
    revalidatePath("/dashboard/settings/whatsapp");
    return { ok: true, data };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't set that up" };
    }
    return { ok: false, error: "Couldn't set that up" };
  }
}

export async function syncTemplatesAction(): Promise<
  ActionResult<WhatsappTemplate[]>
> {
  try {
    const data = await apiFetch<WhatsappTemplate[]>("/templates/sync", {
      method: "POST",
    });
    revalidatePath("/dashboard/broadcasts/new");
    return { ok: true, data };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't sync templates" };
    }
    return { ok: false, error: "Couldn't sync templates" };
  }
}
