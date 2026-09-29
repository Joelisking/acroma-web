"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { estateSettingsInput, type EstateSettings } from "@/lib/real-estate"
import { saveEstateSettings } from "@/lib/api/real-estate-actions"
import type { OpeningHours } from "@/lib/api/types"
import {
  AppointmentTypeFields,
  type AppointmentTypeValues,
} from "@/components/real-estate/appointment-type-fields"
import { OnboardingOpeningHoursStep } from "./opening-hours-step"

type Props = {
  settings: EstateSettings
  hours: OpeningHours | null
}

/**
 * Real estate replaces the plain opening-hours step: agencies set viewing
 * and consultation fees and durations, then the weekly availability both
 * types share. One "Save & continue" saves the fees first, then the hours.
 */
export function EstateAppointmentsStep({ settings, hours }: Props) {
  const form = useForm<AppointmentTypeValues>({
    resolver: zodResolver(estateSettingsInput),
    defaultValues: {
      viewingFee: settings.viewingFee,
      consultationFee: settings.consultationFee,
      viewingDurationMinutes: settings.viewingDurationMinutes,
      consultationDurationMinutes: settings.consultationDurationMinutes,
    },
  })

  async function saveTypes() {
    if (!(await form.trigger(undefined, { shouldFocus: true }))) return false
    const result = await saveEstateSettings(form.getValues())
    if (!result.ok) toast.error(result.error)
    return result.ok
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Appointment types</h2>
          <p className="text-sm text-muted-foreground">
            Set a fee and duration for each. Use 0 for free appointments.
          </p>
        </div>
        <AppointmentTypeFields form={form} currency={settings.currency} />
      </section>
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Shared availability</h2>
          <p className="text-sm text-muted-foreground">
            Viewings and consultations are booked inside these hours, in Ghana
            time.
          </p>
        </div>
        <OnboardingOpeningHoursStep initial={hours} beforeSave={saveTypes} />
      </section>
    </div>
  )
}
