"use server";

import { apiFetch, ApiError } from "./server";
import type { ParsedProduct } from "./types";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function parseProductAction(input: {
  description: string;
  followUp?: string;
  current?: Record<string, unknown>;
}): Promise<ActionResult<ParsedProduct>> {
  try {
    const data = await apiFetch<{ parsed: ParsedProduct }>("/products/parse", {
      method: "POST",
      body: input,
    });
    return { ok: true, data: data.parsed };
  } catch (err) {
    return {
      ok: false,
      error: humanError(err, "Couldn't read that. Try a bit more detail"),
    };
  }
}

export async function autofillProductAction(
  productName: string,
): Promise<ActionResult<{ category: string | null; description: string | null }>> {
  try {
    const data = await apiFetch<{
      category: string | null;
      description: string | null;
    }>("/products/autofill", {
      method: "POST",
      body: { productName },
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't auto-fill") };
  }
}

function humanError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
