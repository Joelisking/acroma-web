"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "./server";
import type { Business } from "./types";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function updateBusinessAction(input: {
  name?: string;
  currency?: string;
  country?: string;
  logoUrl?: string;
  aiEnabled?: boolean;
  businessDescription?: string;
  aiBusinessContext?: string;
}): Promise<ActionResult<Business>> {
  try {
    const data = await apiFetch<Business>("/business/me", {
      method: "PATCH",
      body: input,
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    return { ok: true, data };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't save changes" };
    }
    return { ok: false, error: "Couldn't save changes" };
  }
}
