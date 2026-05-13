"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "./server";
import type { Broadcast, BroadcastAudienceBucket } from "./types";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type BroadcastInput = {
  name: string;
  audienceBucket: BroadcastAudienceBucket;
  bodyTemplate: string;
  templateId?: string | null;
  templateLanguage?: string | null;
  discountId?: string | null;
};

function cleanPayload(input: BroadcastInput): Record<string, unknown> {
  const out: Record<string, unknown> = {
    name: input.name,
    audienceBucket: input.audienceBucket,
    bodyTemplate: input.bodyTemplate,
  };
  if (input.templateId) out.templateId = input.templateId;
  if (input.templateLanguage) out.templateLanguage = input.templateLanguage;
  if (input.discountId) out.discountId = input.discountId;
  return out;
}

export async function createBroadcastAction(
  input: BroadcastInput,
): Promise<ActionResult<Broadcast>> {
  try {
    const data = await apiFetch<Broadcast>("/broadcasts", {
      method: "POST",
      body: cleanPayload(input),
    });
    revalidatePath("/dashboard/broadcasts");
    return { ok: true, data };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't create broadcast" };
    }
    return { ok: false, error: "Couldn't create broadcast" };
  }
}

export async function updateBroadcastAction(
  id: string,
  input: Partial<BroadcastInput>,
): Promise<ActionResult<Broadcast>> {
  try {
    const data = await apiFetch<Broadcast>(`/broadcasts/${id}`, {
      method: "PATCH",
      body: input,
    });
    revalidatePath("/dashboard/broadcasts");
    revalidatePath(`/dashboard/broadcasts/${id}`);
    return { ok: true, data };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't update broadcast" };
    }
    return { ok: false, error: "Couldn't update broadcast" };
  }
}

export async function enqueueBroadcastAction(
  id: string,
): Promise<ActionResult<Broadcast>> {
  try {
    const data = await apiFetch<Broadcast>(`/broadcasts/${id}/send`, {
      method: "POST",
    });
    revalidatePath("/dashboard/broadcasts");
    revalidatePath(`/dashboard/broadcasts/${id}`);
    return { ok: true, data };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't send" };
    }
    return { ok: false, error: "Couldn't send" };
  }
}

export async function cancelBroadcastAction(
  id: string,
): Promise<ActionResult<Broadcast>> {
  try {
    const data = await apiFetch<Broadcast>(`/broadcasts/${id}/cancel`, {
      method: "POST",
    });
    revalidatePath("/dashboard/broadcasts");
    revalidatePath(`/dashboard/broadcasts/${id}`);
    return { ok: true, data };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't cancel" };
    }
    return { ok: false, error: "Couldn't cancel" };
  }
}
