"use server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { ApiError, apiFetch } from "./server"
import {
  appointmentKind,
  appointmentSchema,
  availabilitySchema,
  bookingInput,
  estateSettingsInput,
  estateCalendarViewInput,
  listingInput,
} from "@/lib/real-estate"

function errorResult(error: unknown) {
  const alternatives =
    error instanceof ApiError &&
    typeof error.body === "object" &&
    "alternatives" in error.body
      ? z.array(z.string()).catch([]).parse(error.body.alternatives)
      : []
  return {
    ok: false as const,
    error:
      error instanceof z.ZodError
        ? error.issues[0].message
        : error instanceof Error
          ? error.message
          : "Please try again",
    alternatives,
  }
}
function refreshEstate() {
  revalidatePath("/dashboard/properties")
  revalidatePath("/dashboard/appointments")
}
export async function saveProperty(input: unknown, id?: string) {
  try {
    const body = listingInput.parse(input)
    if (id) z.uuid().parse(id)
    await apiFetch(`/real-estate/listings${id ? `/${id}` : ""}`, {
      method: id ? "PATCH" : "POST",
      body,
    })
    refreshEstate()
    return { ok: true as const }
  } catch (error) {
    return errorResult(error)
  }
}
export async function saveEstateSettings(input: unknown) {
  try {
    await apiFetch("/real-estate/settings", {
      method: "PATCH",
      body: estateSettingsInput.parse(input),
    })
    refreshEstate()
    revalidatePath("/dashboard/appointments/settings")
    return { ok: true as const }
  } catch (error) {
    return errorResult(error)
  }
}
export async function saveEstateCalendarView(input: unknown) {
  try {
    await apiFetch("/real-estate/settings/calendar-view", {
      method: "PATCH",
      body: estateCalendarViewInput.parse(input),
    })
    revalidatePath("/dashboard/appointments")
    revalidatePath("/dashboard/appointments/settings")
    return { ok: true as const }
  } catch (error) {
    return errorResult(error)
  }
}
export async function getEstateSlots(input: unknown) {
  try {
    const q = z
      .object({
        kind: appointmentKind,
        propertyId: z.uuid().optional(),
        day: z.iso.date(),
      })
      .parse(input)
    const params = new URLSearchParams(
      Object.entries(q).filter((entry): entry is [string, string] => !!entry[1])
    )
    const value = availabilitySchema.parse(
      await apiFetch(`/real-estate/availability?${params}`)
    )
    return { ok: true as const, value }
  } catch (error) {
    return errorResult(error)
  }
}
export async function bookEstateAppointment(input: unknown) {
  try {
    const value = appointmentSchema.parse(
      await apiFetch("/real-estate/appointments", {
        method: "POST",
        body: bookingInput.parse(input),
      })
    )
    refreshEstate()
    return { ok: true as const, value }
  } catch (error) {
    refreshEstate()
    return errorResult(error)
  }
}
export async function estateAppointmentAction(id: string, action: string) {
  try {
    z.uuid().parse(id)
    z.enum(["cancel", "complete"]).parse(action)
    await apiFetch(`/real-estate/appointments/${id}`, {
      method: "PATCH",
      body: { action },
    })
    refreshEstate()
    return { ok: true as const }
  } catch (error) {
    return errorResult(error)
  }
}
export async function retryEstatePayment(id: string) {
  try {
    z.uuid().parse(id)
    const value = appointmentSchema.parse(
      await apiFetch(`/real-estate/appointments/${id}/payment-link`, {
        method: "POST",
      })
    )
    refreshEstate()
    return { ok: true as const, value }
  } catch (error) {
    return errorResult(error)
  }
}

export async function estateRescheduleSlots(id: string, day: string) {
  try {
    z.uuid().parse(id)
    z.iso.date().parse(day)
    const value = availabilitySchema.parse(
      await apiFetch(
        `/real-estate/appointments/${id}/availability?${new URLSearchParams({ day })}`
      )
    )
    return { ok: true as const, value }
  } catch (error) {
    return errorResult(error)
  }
}

export async function rescheduleEstateAppointment(
  id: string,
  startsAt: string,
  expectedStartsAt: string
) {
  try {
    z.uuid().parse(id)
    z.iso.datetime({ offset: true }).parse(startsAt)
    z.iso.datetime({ offset: true }).parse(expectedStartsAt)
    const value = appointmentSchema.parse(
      await apiFetch(`/real-estate/appointments/${id}/reschedule`, {
        method: "PATCH",
        body: { startsAt, expectedStartsAt },
      })
    )
    refreshEstate()
    return { ok: true as const, value }
  } catch (error) {
    refreshEstate()
    return errorResult(error)
  }
}
