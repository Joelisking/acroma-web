"use client"
import { useRef, useState } from "react"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { z } from "zod"
import {
  bookingInput,
  estateMoney,
  estateTime,
  type Appointment,
  type Availability,
  type Listing,
} from "@/lib/real-estate"
import {
  bookEstateAppointment,
  getEstateSlots,
} from "@/lib/api/real-estate-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AppointmentSelectors } from "./appointment-selectors"
import { AppointmentResult } from "./appointment-result"
import { EstateDayPicker } from "./estate-day-picker"

const formSchema = bookingInput.omit({ requestKey: true })
export function AppointmentBooker({
  properties,
  initialDay,
  initialTime,
  initialAppointment,
  onCreated,
}: {
  properties: Listing[]
  initialDay: string
  initialTime?: string
  initialAppointment?: Appointment
  onCreated?: (appointment: Appointment) => void
}) {
  const slotRequest = useRef(0)
  const [day, setDay] = useState(initialDay)
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState<Appointment | null>(null)
  const [lastRequest, setLastRequest] = useState<{
    body: string
    key: string
  } | null>(null)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kind: initialAppointment?.kind ?? "CONSULTATION",
      propertyId: initialAppointment?.propertyId ?? undefined,
      customerName: initialAppointment?.customerName ?? "",
      customerPhone: initialAppointment?.customerPhone ?? "",
      startsAt: "",
    },
  })
  const kind = useWatch({ control: form.control, name: "kind" })
  function resetSlots() {
    slotRequest.current++
    setAvailability(null)
    form.setValue("startsAt", "")
    setCreated(null)
  }
  async function loadSlots() {
    setLoading(true)
    resetSlots()
    const request = slotRequest.current
    const result = await getEstateSlots({
      kind,
      propertyId: kind === "VIEWING" ? form.getValues("propertyId") : undefined,
      day,
    })
    setLoading(false)
    if (request !== slotRequest.current) return
    if (!result.ok) return toast.error(result.error)
    setAvailability(result.value)
    const preferred =
      initialTime && day === initialDay
        ? result.value.slots.find(
            (slot) => +new Date(slot) === +new Date(initialTime)
          )
        : undefined
    if (preferred) form.setValue("startsAt", preferred)
  }
  async function submit(values: z.infer<typeof formSchema>) {
    const body = JSON.stringify(values)
    const key =
      lastRequest?.body === body ? lastRequest.key : crypto.randomUUID()
    setLastRequest({ body, key })
    const result = await bookEstateAppointment({
      ...values,
      expectedFee: availability?.fee,
      expectedCurrency: availability?.currency,
      expectedDurationMinutes: availability?.durationMinutes,
      requestKey: key,
    })
    if (!result.ok) {
      toast.error(result.error)
      if (result.alternatives.length && availability) {
        setAvailability({ ...availability, slots: result.alternatives })
        form.setValue("startsAt", "")
      }
      return
    }
    if (onCreated) onCreated(result.value)
    else setCreated(result.value)
    toast.success(
      result.value.status === "CONFIRMED"
        ? "Appointment confirmed"
        : "Appointment held for payment"
    )
  }
  if (created)
    return (
      <AppointmentResult
        created={created}
        onAnother={() => {
          setLastRequest(null)
          resetSlots()
        }}
      />
    )
  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
      <AppointmentSelectors
        form={form}
        properties={properties}
        kind={kind}
        onChange={resetSlots}
      />
      <div className="flex flex-wrap gap-2">
        <EstateDayPicker
          day={day}
          onChange={(value) => {
            setDay(value)
            resetSlots()
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => void loadSlots()}
          disabled={loading}
        >
          {loading ? "Checking…" : "Find available times"}
        </Button>
      </div>
      {availability && (
        <div className="space-y-2">
          <p className="text-sm">
            {availability.durationMinutes} minutes ·{" "}
            {availability.fee === 0
              ? "Free appointment"
              : estateMoney(availability.fee, availability.currency)}{" "}
            · Ghana time
          </p>
          {!availability.slots.length ? (
            <p className="text-sm text-muted-foreground">
              No times available. Try another date or check opening hours.
            </p>
          ) : (
            <>
              <Label htmlFor="appointment-time">Available time</Label>
              <Controller
                control={form.control}
                name="startsAt"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="appointment-time">
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
                )}
              />
            </>
          )}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="buyer-name">Buyer name</Label>
        <Input
          id="buyer-name"
          autoComplete="name"
          {...form.register("customerName")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="buyer-phone">WhatsApp number</Label>
        <Input
          id="buyer-phone"
          type="tel"
          placeholder="+233…"
          {...form.register("customerPhone")}
        />
      </div>
      <p role="alert" className="text-sm text-destructive">
        {Object.values(form.formState.errors)[0]?.message}
      </p>
      {availability && availability.fee > 0 && (
        <p className="text-sm text-muted-foreground">
          The slot is held for 15 minutes. Payment confirms the appointment.
          This fee does not buy the property.
        </p>
      )}
      <Button
        disabled={form.formState.isSubmitting || !availability?.slots.length}
      >
        {form.formState.isSubmitting
          ? "Booking…"
          : availability?.fee
            ? "Hold appointment for payment"
            : "Confirm free appointment"}
      </Button>
    </form>
  )
}
