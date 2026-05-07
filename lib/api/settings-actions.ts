"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "./server";
import type { WhatsappSettings } from "./settings";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

type WhatsappInput = {
  phoneNumberId?: string;
  accessToken?: string;
  businessAccountId?: string;
};

export async function updateWhatsappAction(
  input: WhatsappInput,
): Promise<ActionResult<WhatsappSettings>> {
  try {
    const data = await apiFetch<WhatsappSettings>("/settings/whatsapp", {
      method: "PATCH",
      body: input,
    });
    revalidatePath("/dashboard/settings/whatsapp");
    revalidatePath("/dashboard");
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't save WhatsApp") };
  }
}

export async function testWhatsappAction(
  toPhone: string,
): Promise<ActionResult> {
  // Strip everything that isn't a digit (handles "+", spaces, dashes, etc.).
  const normalized = toPhone.replace(/\D/g, "");
  if (!/^\d{8,15}$/.test(normalized)) {
    return {
      ok: false,
      error:
        "Use a full WhatsApp number with country code, e.g. 233244000000.",
    };
  }
  try {
    await apiFetch<{ success: boolean }>("/settings/whatsapp/test", {
      method: "POST",
      body: { toPhone: normalized },
    });
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: humanError(err, "Test message failed") };
  }
}

function humanError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
