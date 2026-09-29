"use client"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { z } from "zod"
import { estateSettingsInput, type EstateSettings } from "@/lib/real-estate"
import { saveEstateSettings } from "@/lib/api/real-estate-actions"
import { Button } from "@/components/ui/button"
import { AppointmentTypeFields } from "./appointment-type-fields"

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
      <AppointmentTypeFields form={form} currency={settings.currency} />
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
