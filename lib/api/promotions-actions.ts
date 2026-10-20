"use server"

import { revalidatePath } from "next/cache"
import { apiFetch, ApiError } from "./server"
import type { Promotion, PromotionMenuMode, PromotionPrice } from "./types"

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export type PromotionInput = {
  name?: string
  description?: string | null
  menuMode?: PromotionMenuMode
  startsAt?: string | null
  endsAt?: string | null
  menuImageUrls?: string[]
  menuPdfUrl?: string | null
  isActive?: boolean
}

export type PromotionPriceInput = {
  productId: string
  variantId?: string | null
  price: number
}

function fail(err: unknown, fallback: string): { ok: false; error: string } {
  return {
    ok: false,
    error: err instanceof ApiError ? err.message || fallback : fallback,
  }
}

function revalidate(id?: string) {
  revalidatePath("/dashboard/promotions")
  if (id) revalidatePath(`/dashboard/promotions/${id}`)
  // Promotions change what the catalog and till sell and at what price.
  revalidatePath("/dashboard/catalog")
  revalidatePath("/dashboard/till")
}

export async function createPromotionAction(
  input: PromotionInput & { name: string }
): Promise<ActionResult<Promotion>> {
  try {
    const data = await apiFetch<Promotion>("/promotions", {
      method: "POST",
      body: input,
    })
    revalidate()
    return { ok: true, data }
  } catch (err) {
    return fail(err, "Couldn't create promotion")
  }
}

export async function updatePromotionAction(
  id: string,
  input: PromotionInput
): Promise<ActionResult<Promotion>> {
  try {
    const data = await apiFetch<Promotion>(`/promotions/${id}`, {
      method: "PATCH",
      body: input,
    })
    revalidate(id)
    return { ok: true, data }
  } catch (err) {
    return fail(err, "Couldn't save promotion")
  }
}

export async function setPromotionPricesAction(
  id: string,
  prices: PromotionPriceInput[]
): Promise<ActionResult<PromotionPrice[]>> {
  try {
    const data = await apiFetch<PromotionPrice[]>(`/promotions/${id}/prices`, {
      method: "PUT",
      body: { prices },
    })
    revalidate(id)
    return { ok: true, data }
  } catch (err) {
    return fail(err, "Couldn't save promo prices")
  }
}

export async function archivePromotionAction(
  id: string
): Promise<ActionResult> {
  try {
    await apiFetch(`/promotions/${id}/archive`, { method: "POST" })
    revalidate(id)
    return { ok: true, data: undefined }
  } catch (err) {
    return fail(err, "Couldn't archive promotion")
  }
}
