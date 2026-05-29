"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "./server";
import type { WhatsappSettings } from "./settings";
import type { OpeningHours, ReminderSettings } from "./types";

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

export async function updateAcceptsCashOnDeliveryAction(
  acceptsCashOnDelivery: boolean,
): Promise<ActionResult<{ id: string; acceptsCashOnDelivery: boolean }>> {
  try {
    const data = await apiFetch<{ id: string; acceptsCashOnDelivery: boolean }>(
      "/settings/payment-methods",
      {
        method: "PATCH",
        body: { acceptsCashOnDelivery },
      },
    );
    revalidatePath("/dashboard/settings/payments");
    revalidatePath("/dashboard");
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: humanError(err, "Couldn't save payment method preferences"),
    };
  }
}

export async function updateAcceptsPickupAction(
  acceptsPickup: boolean,
): Promise<ActionResult<{ id: string; acceptsPickup: boolean }>> {
  try {
    const data = await apiFetch<{ id: string; acceptsPickup: boolean }>(
      "/settings/order-options",
      {
        method: "PATCH",
        body: { acceptsPickup },
      },
    );
    revalidatePath("/dashboard/settings/payments");
    revalidatePath("/dashboard");
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: humanError(err, "Couldn't save pickup preference"),
    };
  }
}

export async function updateOrderAlertsEnabledAction(
  orderAlertsEnabled: boolean,
): Promise<
  ActionResult<{
    id: string;
    acceptsPickup: boolean;
    orderAlertsEnabled: boolean;
  }>
> {
  try {
    const data = await apiFetch<{
      id: string;
      acceptsPickup: boolean;
      orderAlertsEnabled: boolean;
    }>("/settings/order-options", {
      method: "PATCH",
      body: { orderAlertsEnabled },
    });
    revalidatePath("/dashboard/settings/payments");
    revalidatePath("/dashboard");
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: humanError(err, "Couldn't save alert preference"),
    };
  }
}

export async function updateOpeningHoursAction(
  hours: OpeningHours,
): Promise<ActionResult<{ id: string; openingHours: OpeningHours | null }>> {
  try {
    const data = await apiFetch<{
      id: string;
      openingHours: OpeningHours | null;
    }>("/settings/opening-hours", {
      method: "PATCH",
      body: hours,
    });
    revalidatePath("/dashboard/settings/opening-hours");
    revalidatePath("/dashboard");
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: humanError(err, "Couldn't save opening hours"),
    };
  }
}

export async function clearOpeningHoursAction(): Promise<
  ActionResult<{ id: string; openingHours: OpeningHours | null }>
> {
  try {
    const data = await apiFetch<{
      id: string;
      openingHours: OpeningHours | null;
    }>("/settings/opening-hours", {
      method: "DELETE",
    });
    revalidatePath("/dashboard/settings/opening-hours");
    revalidatePath("/dashboard");
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: humanError(err, "Couldn't clear opening hours"),
    };
  }
}

export async function updateReminderSettingsAction(
  patch: Partial<ReminderSettings>,
): Promise<ActionResult<ReminderSettings>> {
  try {
    const data = await apiFetch<ReminderSettings>("/settings/reminders", {
      method: "PATCH",
      body: patch,
    });
    revalidatePath("/dashboard/settings/reminders");
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: humanError(err, "Couldn't save reminder settings"),
    };
  }
}

export async function updateCatalogImagesAction(
  urls: string[],
): Promise<ActionResult<{ id: string; catalogImageUrls: string[] }>> {
  try {
    const data = await apiFetch<{ id: string; catalogImageUrls: string[] }>(
      "/settings/catalog-images",
      {
        method: "PUT",
        body: { urls },
      },
    );
    revalidatePath("/dashboard/settings/business");
    revalidatePath("/dashboard");
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't save catalog images") };
  }
}

export async function updateAiEnabledAction(
  aiEnabled: boolean,
): Promise<ActionResult<{ id: string; aiEnabled: boolean }>> {
  try {
    const data = await apiFetch<{ id: string; aiEnabled: boolean }>(
      '/settings/ai',
      { method: 'PATCH', body: { aiEnabled } },
    );
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/conversations');
    revalidatePath('/dashboard/settings/ai');
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't update AI mode") };
  }
}

function humanError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
