"use client"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Appointment, Listing } from "@/lib/real-estate"
import { AppointmentCard } from "./appointment-card"
import { AppointmentReschedule } from "./appointment-reschedule"

export function AppointmentDetails({
  appointment: a,
  property,
  now,
  onClose,
  onMoved,
  onBookAgain,
}: {
  appointment: Appointment
  property?: Listing
  now: number
  onClose: () => void
  onMoved: (a: Appointment) => void
  onBookAgain: () => void
}) {
  const [moving, setMoving] = useState(false)
  const canMove =
    ["CONFIRMED", "HOLD"].includes(a.status) && +new Date(a.startsAt) > now
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {a.kind === "VIEWING" ? "Property viewing" : "Consultation"}
          </DialogTitle>
          <DialogDescription>
            Appointment details and actions. All times are in Ghana time (UTC).
          </DialogDescription>
        </DialogHeader>
        {property && (
          <Link
            href={`/dashboard/properties/${property.id}`}
            className="font-medium text-primary underline"
          >
            {property.title} · {property.location}
          </Link>
        )}
        <AppointmentCard appointment={a} propertyTitle={property?.title} />
        {canMove &&
          (moving ? (
            <AppointmentReschedule
              appointment={a}
              onClose={() => setMoving(false)}
              onMoved={(value) => {
                setMoving(false)
                onMoved(value)
              }}
            />
          ) : (
            <Button variant="outline" onClick={() => setMoving(true)}>
              Reschedule appointment
            </Button>
          ))}
        {!canMove &&
          ["CANCELLED", "EXPIRED", "COMPLETED"].includes(a.status) && (
            <Button variant="outline" onClick={onBookAgain}>
              Book another appointment
            </Button>
          )}
      </DialogContent>
    </Dialog>
  )
}
