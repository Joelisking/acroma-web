"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Appointment, Listing } from "@/lib/real-estate"
import { dayLabel } from "@/lib/estate-calendar"
import { AppointmentBooker } from "./appointment-booker"
import { refundLabel } from "@/lib/estate-refunds"
export type CalendarCreation = {
  day: string
  time?: string
  appointment?: Appointment
}
export function CalendarDialogs({
  creation,
  setCreation,
  reviewingRefunds,
  setReviewingRefunds,
  refunds,
  properties,
  onCreated,
  onAppointment,
}: {
  creation: CalendarCreation | null
  setCreation: (value: CalendarCreation | null) => void
  reviewingRefunds: boolean
  setReviewingRefunds: (value: boolean) => void
  refunds: Appointment[]
  properties: Listing[]
  onCreated: (a: Appointment) => void
  onAppointment: (id: string) => void
}) {
  return (
    <>
      <Dialog
        open={!!creation}
        onOpenChange={(open) => {
          if (!open) setCreation(null)
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Book an appointment</DialogTitle>
            <DialogDescription>
              Viewings and consultations share this calendar. All times are in
              Ghana time.
            </DialogDescription>
          </DialogHeader>
          {creation && (
            <AppointmentBooker
              key={`${creation.day}-${creation.time}-${creation.appointment?.id}`}
              properties={properties}
              initialDay={creation.day}
              initialTime={creation.time}
              initialAppointment={creation.appointment}
              onCreated={(a) => {
                onCreated(a)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={reviewingRefunds} onOpenChange={setReviewingRefunds}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Refund review</DialogTitle>
            <DialogDescription>
              Outstanding and requested refunds across all dates. Open an
              appointment to request a refund or check its progress.
            </DialogDescription>
          </DialogHeader>
          {refunds.length ? (
            refunds.map((a) => (
              <Button
                key={a.id}
                variant="outline"
                className="h-auto justify-start py-3 text-left whitespace-normal"
                onClick={() => {
                  setReviewingRefunds(false)
                  onAppointment(a.id)
                }}
              >
                {a.customerName} ·{" "}
                {dayLabel(a.startsAt.slice(0, 10), {
                  day: "numeric",
                  month: "short",
                })}
                {" · "}{refundLabel(a)}
              </Button>
            ))
          ) : (
            <p>No refunds need review.</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
