"use client"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { estateCalendarViewInput, type EstateSettings } from "@/lib/real-estate"
import { saveEstateCalendarView } from "@/lib/api/real-estate-actions"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const labels = { WEEK: "Week", DAY: "Day", MONTH: "Month" } as const
export function CalendarViewSettingsForm({
  defaultView,
}: {
  defaultView: EstateSettings["defaultCalendarView"]
}) {
  const form = useForm<z.infer<typeof estateCalendarViewInput>>({
    resolver: zodResolver(estateCalendarViewInput),
    defaultValues: { defaultCalendarView: defaultView },
  })
  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        const result = await saveEstateCalendarView(values)
        if (!result.ok) toast.error(result.error)
        else {
          form.reset(values)
          toast.success("Default calendar view saved")
        }
      })}
    >
      <div className="space-y-2">
        <Label htmlFor="default-calendar-view">Default calendar view</Label>
        <Controller
          control={form.control}
          name="defaultCalendarView"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={form.formState.isSubmitting}
            >
              <SelectTrigger
                id="default-calendar-view"
                aria-describedby="default-calendar-view-help"
                className="w-full sm:max-w-xs"
              >
                <SelectValue>{labels[field.value]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEEK">Week</SelectItem>
                <SelectItem value="DAY">Day</SelectItem>
                <SelectItem value="MONTH">Month</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <p
          id="default-calendar-view-help"
          className="text-sm text-muted-foreground"
        >
          Applies to everyone in your agency. You can still switch views in the
          calendar; shared links keep the view they specify.
        </p>
      </div>
      <Button disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving…" : "Save default view"}
      </Button>
    </form>
  )
}
