"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "./server";
import type { FaqCategory, FaqEntry } from "./faq";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type CreateFaqInput = {
  category: FaqCategory;
  question: string;
  answer: string;
  active?: boolean;
};

export type UpdateFaqInput = Partial<{
  category: FaqCategory;
  question: string;
  answer: string;
  active: boolean;
  order: number;
}>;

export type BulkFaqUpdate = {
  id: string;
  active?: boolean;
  answer?: string;
  order?: number;
};

export async function createFaqAction(
  input: CreateFaqInput,
): Promise<ActionResult<FaqEntry>> {
  try {
    const data = await apiFetch<FaqEntry>("/faq", {
      method: "POST",
      body: input,
    });
    revalidatePath("/dashboard/settings/knowledge-base");
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't add the FAQ") };
  }
}

export async function updateFaqAction(
  id: string,
  input: UpdateFaqInput,
): Promise<ActionResult<FaqEntry>> {
  try {
    const data = await apiFetch<FaqEntry>(`/faq/${id}`, {
      method: "PATCH",
      body: input,
    });
    revalidatePath("/dashboard/settings/knowledge-base");
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't save the FAQ") };
  }
}

export async function deleteFaqAction(
  id: string,
): Promise<ActionResult<{ ok: true }>> {
  try {
    const data = await apiFetch<{ ok: true }>(`/faq/${id}`, {
      method: "DELETE",
    });
    revalidatePath("/dashboard/settings/knowledge-base");
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't delete the FAQ") };
  }
}

export async function bulkUpdateFaqAction(
  entries: BulkFaqUpdate[],
): Promise<ActionResult<{ updated: number }>> {
  try {
    const data = await apiFetch<{ updated: number }>("/faq/bulk", {
      method: "PATCH",
      body: { entries },
    });
    revalidatePath("/dashboard/settings/knowledge-base");
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't save changes") };
  }
}

export async function resetFaqToTemplateAction(): Promise<
  ActionResult<{ created: number }>
> {
  try {
    const data = await apiFetch<{ created: number }>("/faq/reset-to-template", {
      method: "POST",
    });
    revalidatePath("/dashboard/settings/knowledge-base");
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: humanError(err, "Couldn't reset the knowledge base"),
    };
  }
}

function humanError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
