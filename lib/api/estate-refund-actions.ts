"use server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { apiFetch } from "./server"
import { appointmentSchema } from "@/lib/real-estate"
import { refundAccountInput, refundBanksSchema } from "@/lib/estate-refunds"

function failure(error: unknown) {
  return {
    ok: false as const,
    error: error instanceof Error ? error.message : "Please try again",
  }
}
function base(id: string) {
  return `/real-estate/appointments/${z.uuid().parse(id)}/refund`
}
export async function manageEstateRefund(
  id: string,
  action: "request" | "refresh"
) {
  try {
    z.enum(["request", "refresh"]).parse(action)
    const value = appointmentSchema.parse(
      await apiFetch(`${base(id)}${action === "refresh" ? "/refresh" : ""}`, {
        method: "POST",
      })
    )
    revalidatePath("/dashboard/appointments")
    return { ok: true as const, value }
  } catch (error) {
    return failure(error)
  }
}
export async function estateRefundBanks(id: string) {
  try {
    return {
      ok: true as const,
      value: refundBanksSchema.parse(await apiFetch(`${base(id)}/banks`)),
    }
  } catch (error) {
    return failure(error)
  }
}
export async function estateRefundAccount(id: string, input: unknown) {
  try {
    const value = z
      .object({ accountName: z.string() })
      .parse(
        await apiFetch(`${base(id)}/account`, {
          method: "POST",
          body: refundAccountInput.parse(input),
        })
      )
    return { ok: true as const, value }
  } catch (error) {
    return failure(error)
  }
}
export async function confirmEstateRefundAccount(id: string, input: unknown) {
  try {
    const body = refundAccountInput
      .extend({ expectedAccountName: z.string().min(1).max(200) })
      .parse(input)
    await apiFetch(`${base(id)}/account/confirm`, { method: "POST", body })
    revalidatePath("/dashboard/appointments")
    return { ok: true as const }
  } catch (error) {
    return failure(error)
  }
}
