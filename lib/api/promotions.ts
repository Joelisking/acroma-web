import "server-only"

import { apiFetch } from "./server"
import type { CurrentPromotions, Promotion, PromotionDetail } from "./types"

export async function listPromotions(): Promise<Promotion[]> {
  return apiFetch<Promotion[]>("/promotions")
}

export async function getPromotion(id: string): Promise<PromotionDetail> {
  return apiFetch<PromotionDetail>(`/promotions/${id}`)
}

/** The live and next scheduled promotion. Readable by staff (the till). */
export async function getCurrentPromotions(): Promise<CurrentPromotions> {
  return apiFetch<CurrentPromotions>("/promotions/current")
}
