"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "./server";

type ActionResult = { ok: true } | { ok: false; error: string };

export type BusinessType =
  | "ELECTRONICS"
  | "FASHION_CLOTHING"
  | "FOOD_BEVERAGES"
  | "BEAUTY_COSMETICS"
  | "HOME_FURNITURE"
  | "SERVICES"
  | "GENERAL_STORE"
  | "OTHER";

export async function setBusinessTypeAction(input: {
  businessType: BusinessType;
  businessDescription?: string;
}): Promise<ActionResult> {
  try {
    await apiFetch<{ success: boolean; aiBusinessContext: string | null }>(
      "/onboarding/business-type",
      { method: "POST", body: input },
    );
    revalidatePath("/onboarding", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't save business type") };
  }
}

export async function completeOnboardingAction(): Promise<void> {
  try {
    await apiFetch<{ success: boolean }>("/onboarding/complete", {
      method: "POST",
    });
  } catch (err) {
    console.error(err);
  }
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

export async function completeOnboardingAndConnectWhatsappAction(): Promise<void> {
  try {
    await apiFetch<{ success: boolean }>("/onboarding/complete", {
      method: "POST",
    });
  } catch (err) {
    console.error(err);
  }
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/settings/whatsapp?from=onboarding");
}

function humanError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
