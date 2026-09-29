"use client"
import { useEffect, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { Appointment, Listing } from "@/lib/real-estate"
import {
  calendarRange,
  currentAppointment,
  dayKey,
  type CalendarView,
} from "@/lib/estate-calendar"
import { CalendarToolbar } from "./calendar-toolbar"
import { CalendarMonth } from "./calendar-month"
import { CalendarTimeline } from "./calendar-timeline"
import { CalendarAgenda } from "./calendar-agenda"
import { AppointmentDetails } from "./appointment-details"
import { CalendarDialogs, type CalendarCreation } from "./calendar-dialogs"

export function AgencyCalendar({
  appointments,
  properties,
  refunds,
  day,
  view,
  initialNow,
  selectedAppointment,
}: {
  appointments: Appointment[]
  properties: Listing[]
  refunds: Appointment[]
  day: string
  view: CalendarView
  initialNow: number
  selectedAppointment: Appointment | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [now, setNow] = useState(initialNow)
  const selectedId = useSearchParams().get("appointment")
  const [creation, setCreation] = useState<CalendarCreation | null>(null)
  const [optimistic, setOptimistic] = useState<Appointment | null>(null)
  const [reviewingRefunds, setReviewingRefunds] = useState(false)
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now())
      router.refresh()
    }, 30000)
    return () => clearInterval(timer)
  }, [router])
  const records = new Map(
    [
      ...appointments,
      ...refunds,
      ...(selectedAppointment ? [selectedAppointment] : []),
    ].map((a) => [a.id, a])
  )
  if (
    optimistic &&
    (!records.has(optimistic.id) ||
      records.get(optimistic.id)!.updatedAt < optimistic.updatedAt)
  )
    records.set(optimistic.id, optimistic)
  const merged = Array.from(records.values()).map((a) =>
    currentAppointment(a, now)
  )
  const range = calendarRange(day, view)
  const visible = merged.filter(
    (a) => a.startsAt < range.to && a.endsAt > range.from
  )
  const selected = merged.find((a) => a.id === selectedId)
  function navigate(date: string, nextView: CalendarView) {
    startTransition(() =>
      router.push(
        `/dashboard/appointments?${new URLSearchParams({ day: date, view: nextView })}`,
        { scroll: false }
      )
    )
  }
  function openAppointment(id: string, date = day) {
    startTransition(() =>
      router.push(
        `/dashboard/appointments?${new URLSearchParams({ day: date, view, appointment: id })}`,
        { scroll: false }
      )
    )
  }
  function closeDetails() {
    startTransition(() =>
      router.replace(
        `/dashboard/appointments?${new URLSearchParams({ day, view })}`,
        { scroll: false }
      )
    )
  }
  function create(date: string, time?: string) {
    setCreation({ day: date, time })
  }
  const interaction = {
    appointments: visible,
    onDay: (date: string) => navigate(date, "day"),
    onAppointment: openAppointment,
    onCreate: create,
  }
  return (
    <div className="space-y-4">
      {refunds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-card p-4">
          <div>
            <p className="font-semibold">
              {refunds.length}{" "}
              {refunds.length === 1 ? "refund to follow up" : "refunds to follow up"}
            </p>
            <p className="text-sm text-muted-foreground">
              Outstanding and requested refunds across all dates.
            </p>
          </div>
          <Button variant="outline" onClick={() => setReviewingRefunds(true)}>
            Review refunds
          </Button>
        </div>
      )}
      <section
        aria-label="Agency appointment calendar"
        aria-busy={pending}
        className="overflow-hidden rounded-2xl border bg-card"
      >
        <CalendarToolbar
          day={day}
          view={view}
          today={dayKey(new Date(now))}
          pending={pending}
          onNavigate={navigate}
          onCreate={() => create(day)}
          onRefresh={() => startTransition(() => router.refresh())}
        />
        {pending && (
          <p role="status" className="bg-accent px-4 py-2 text-sm">
            Loading appointments…
          </p>
        )}
        {!visible.length && (
          <p className="border-b px-4 py-3 text-sm text-muted-foreground">
            No appointments in this {view}. Choose a day or book an appointment.
          </p>
        )}
        {view === "month" ? (
          <CalendarMonth
            days={range.days}
            day={day}
            today={dayKey(new Date(now))}
            {...interaction}
          />
        ) : (
          <>
            <div
              className={
                view === "week" ? "hidden lg:block" : "hidden md:block"
              }
            >
              <CalendarTimeline
                key={`${view}-${range.from}`}
                days={range.days}
                {...interaction}
              />
            </div>
            <div className={view === "week" ? "lg:hidden" : "border-t"}>
              <CalendarAgenda days={range.days} {...interaction} />
            </div>
          </>
        )}
      </section>
      <p className="text-xs text-muted-foreground">
        Choose a date to see all its appointments. Open an appointment to manage
        it. Availability is checked again when booking or rescheduling.
      </p>
      {selected && !creation && (
        <AppointmentDetails
          key={selected.id}
          appointment={selected}
          property={properties.find((p) => p.id === selected.propertyId)}
          now={now}
          onClose={closeDetails}
          onMoved={(a) => {
            setOptimistic(a)
            openAppointment(a.id, a.startsAt.slice(0, 10))
          }}
          onBookAgain={() => {
            closeDetails()
            setCreation({ day, appointment: selected })
          }}
        />
      )}
      <CalendarDialogs
        creation={creation}
        setCreation={setCreation}
        reviewingRefunds={reviewingRefunds}
        setReviewingRefunds={setReviewingRefunds}
        refunds={refunds}
        properties={properties}
        onAppointment={openAppointment}
        onCreated={(a) => {
          setOptimistic(a)
          setCreation(null)
          openAppointment(a.id, a.startsAt.slice(0, 10))
        }}
      />
    </div>
  )
}
