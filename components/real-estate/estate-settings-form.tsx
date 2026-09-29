"use client"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { z } from "zod"
import { estateSettingsInput, type EstateSettings } from "@/lib/real-estate"
import { saveEstateSettings } from "@/lib/api/real-estate-actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function EstateSettingsForm({ settings }: { settings: EstateSettings }) {
  const form = useForm<z.infer<typeof estateSettingsInput>>({
    resolver: zodResolver(estateSettingsInput),
    defaultValues: settings,
  })
  return (
    <form
      onSubmit={form.handleSubmit(async (values) => {
        const result = await saveEstateSettings(values)
        if (!result.ok) toast.error(result.error)
        else toast.success("Appointment fees and durations saved")
      })}
      className="space-y-6"
    >
      <p className="text-sm text-muted-foreground">
        Set a fee to 0 for free appointments. Existing bookings keep their
        agreed fee and duration.
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        {(
          [
            ["viewingFee", "viewingDurationMinutes", "Viewings"],
            ["consultationFee", "consultationDurationMinutes", "Consultations"],
          ] as const
        ).map(([fee, duration, label]) => (
          <fieldset key={fee} className="space-y-4 rounded-xl border p-5">
            <legend className="px-2 font-semibold">{label}</legend>
            <div className="space-y-2">
              <Label htmlFor={fee}>Fee ({settings.currency}) · 0 = free</Label>
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
      <p className="text-sm text-muted-foreground">
        Paid appointments need a{" "}
        <Link
          className="text-primary underline"
          href="/dashboard/settings/payments"
        >
          payout account
        </Link>
        .
      </p>
      <Button disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving…" : "Save fees and durations"}
      </Button>
    </form>
  )
}
