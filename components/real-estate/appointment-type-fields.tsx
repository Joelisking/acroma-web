"use client"
import type { UseFormReturn } from "react-hook-form"
import type { z } from "zod"
import type { estateSettingsInput } from "@/lib/real-estate"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type AppointmentTypeValues = z.infer<typeof estateSettingsInput>

const TYPES = [
  ["viewingFee", "viewingDurationMinutes", "Viewings"],
  ["consultationFee", "consultationDurationMinutes", "Consultations"],
] as const

/** Fee and duration inputs for each appointment type. Shared by the
 * appointment settings page and real estate onboarding. */
export function AppointmentTypeFields({
  form,
  currency,
}: {
  form: UseFormReturn<AppointmentTypeValues>
  currency: string
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {TYPES.map(([fee, duration, label]) => (
        <fieldset key={fee} className="space-y-4 rounded-xl border p-5">
          <legend className="px-2 font-semibold">{label}</legend>
          <div className="space-y-2">
            <Label htmlFor={fee}>Fee ({currency}) · 0 = free</Label>
            <Input
              id={fee}
              type="number"
              min={0}
              step="0.01"
              {...form.register(fee, { valueAsNumber: true })}
            />
            <p className="text-sm text-destructive">
              {form.formState.errors[fee]?.message}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor={duration}>Duration in minutes</Label>
            <Input
              id={duration}
              type="number"
              min={15}
              max={480}
              {...form.register(duration, { valueAsNumber: true })}
            />
            <p className="text-sm text-destructive">
              {form.formState.errors[duration]?.message}
            </p>
          </div>
        </fieldset>
      ))}
    </div>
  )
}
