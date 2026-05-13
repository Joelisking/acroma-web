"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "./server";
import type { WhatsappTemplate } from "./types";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

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
