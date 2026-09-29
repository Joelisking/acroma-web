import "server-only"
import { ApiError, apiFetch } from "./server"
import {
  appointmentSchema,
  estateSettingsSchema,
  listingSchema,
  paymentStateSchema,
} from "@/lib/real-estate"
import { getCurrentBusiness } from "./business"
import { redirect } from "next/navigation"

export async function requireEstate() {
  const business = await getCurrentBusiness()
  if (!business) redirect("/login")
  if (business.businessType !== "REAL_ESTATE") redirect("/dashboard")
  return business
}
export async function listProperties(
  query: { location?: string; maxBudget?: string; currency?: string } = {}
) {
  const params = new URLSearchParams(
    Object.entries(query).filter((entry): entry is [string, string] =>
      Boolean(entry[1])
    )
  )
  return listingSchema
    .array()
    .parse(await apiFetch(`/real-estate/listings?${params}`))
}
export async function estateSettings() {
  return estateSettingsSchema.parse(await apiFetch("/real-estate/settings"))
}
export async function listAppointments(from: string, to: string) {
  return appointmentSchema
    .array()
    .parse(
      await apiFetch(
        `/real-estate/appointments?${new URLSearchParams({ from, to })}`
      )
    )
}
export async function estatePaymentState(reference: string) {
  if (!/^estate_[0-9a-f-]{36}$/.test(reference)) return null
  return paymentStateSchema.parse(
    await apiFetch(`/real-estate/payment/${encodeURIComponent(reference)}`, {
      auth: false,
    })
  )
}
export async function estateRefunds() {
  return appointmentSchema.array().parse(await apiFetch("/real-estate/refunds"))
}
export async function estateAppointment(id: string) {
  try {
    return appointmentSchema.parse(
      await apiFetch(`/real-estate/appointments/${id}`)
    )
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}
