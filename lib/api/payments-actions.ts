"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "./server";
import type { PayoutAccount, ResolvedAccount } from "./types";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function resolveAccountAction(input: {
  accountNumber: string;
  bankCode: string;
}): Promise<ActionResult<ResolvedAccount>> {
  try {
    const data = await apiFetch<ResolvedAccount>("/payments/resolve-account", {
      method: "POST",
      body: input,
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't verify account") };
  }
}

export async function savePayoutAccountAction(input: {
  accountType: "BANK" | "MOBILE_MONEY";
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}): Promise<ActionResult<PayoutAccount>> {
  try {
    const data = await apiFetch<PayoutAccount>("/payments/payout-account", {
      method: "POST",
      body: input,
    });
    revalidatePath("/dashboard/settings/payments");
    revalidatePath("/dashboard");
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: humanError(err, "Couldn't save payout account"),
    };
  }
}

export async function removePayoutAccountAction(): Promise<ActionResult> {
  try {
    await apiFetch<{ success: boolean }>("/payments/payout-account", {
      method: "DELETE",
    });
    revalidatePath("/dashboard/settings/payments");
    revalidatePath("/dashboard");
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't remove account") };
  }
}

function humanError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
