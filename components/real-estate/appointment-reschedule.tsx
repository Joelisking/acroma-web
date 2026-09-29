"use client"
import { useState } from "react"
import { toast } from "sonner"
import {
  estateRescheduleSlots,
  rescheduleEstateAppointment,
} from "@/lib/api/real-estate-actions"
import {
  estateTime,
  type Appointment,
  type Availability,
} from "@/lib/real-estate"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EstateDayPicker } from "./estate-day-picker"

export function AppointmentReschedule({
  appointment,
  onMoved,
  onClose,
}: {
  appointment: Appointment
  onMoved: (a: Appointment) => void
  onClose: () => void
}) {
  const [day, setDay] = useState(appointment.startsAt.slice(0, 10))
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [selected, setSelected] = useState("")
  const [pending, setPending] = useState(false)
  return (
    <section
      className="space-y-4 rounded-xl border p-4"
      aria-label="Reschedule appointment"
    >
      <h3 className="font-semibold">Choose a new time</h3>
      <p className="text-sm text-muted-foreground">
        Your original time stays reserved until the move succeeds. The agreed
        fee, duration and payment stay the same.
        {appointment.status === "HOLD"
          ? " The original payment deadline still applies."
          : ""}
      </p>
      <fieldset disabled={pending} className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <EstateDayPicker
            day={day}
            onChange={(value) => {
              setDay(value)
              setAvailability(null)
              setSelected("")
            }}
          />
          <Button
            variant="outline"
            onClick={async () => {
              setPending(true)
              setSelected("")
              setAvailability(null)
              const result = await estateRescheduleSlots(appointment.id, day)
              setPending(false)
              if (!result.ok) toast.error(result.error)
              else setAvailability(result.value)
            }}
          >
            {pending ? "Checking…" : "Find replacement times"}
          </Button>
        </div>
        {availability &&
          (availability.slots.length ? (
            <div className="space-y-2">
              <Label htmlFor="replacement-time">New appointment time</Label>
              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger id="replacement-time">
                  <SelectValue placeholder="Choose a time" />
                </SelectTrigger>
                <SelectContent>
                  {availability.slots.map((s) => (
                    <SelectItem key={s} value={s}>
                      {estateTime(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No replacement times on this day. Your original booking is
              unchanged.
            </p>
          ))}
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={!selected || pending}
            onClick={async () => {
              setPending(true)
              const result = await rescheduleEstateAppointment(
                appointment.id,
                selected,
                appointment.startsAt
              )
              setPending(false)
              if (!result.ok) {
                toast.error(result.error)
                setSelected("")
                if (availability)
                  setAvailability({
                    ...availability,
                    slots: result.alternatives,
                  })
              } else {
                toast.success("Appointment rescheduled")
                onMoved(result.value)
              }
            }}
          >
            {pending ? "Saving…" : "Confirm new time"}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Keep current time
          </Button>
        </div>
      </fieldset>
    </section>
  )
}
