"use client"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  estateAppointmentAction,
  retryEstatePayment,
} from "@/lib/api/real-estate-actions"
import { estateMoney, estateTime, type Appointment } from "@/lib/real-estate"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AppointmentRefund } from "./appointment-refund"
import { refundLabel } from "@/lib/estate-refunds"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function AppointmentCard({
  appointment: a,
  propertyTitle,
}: {
  appointment: Appointment
  propertyTitle?: string
}) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(timer)
  }, [])
  const [pending, setPending] = useState(false)
  async function act(action: string) {
    setPending(true)
    const result = await estateAppointmentAction(a.id, action)
    setPending(false)
    if (!result.ok) toast.error(result.error)
    else toast.success("Appointment updated")
  }
  return (
    <article className="space-y-3 rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">
          {a.kind === "VIEWING"
            ? (propertyTitle ?? "Property viewing")
            : "Consultation"}
        </h3>
        <Badge variant={a.status === "CONFIRMED" ? "default" : "secondary"}>
          {a.status === "HOLD" ? "Awaiting payment" : a.status.toLowerCase()}
        </Badge>
      </div>
      <p className="text-sm">
        {estateTime(a.startsAt)} –{" "}
        {a.startsAt.slice(0, 10) !== a.endsAt.slice(0, 10)
          ? estateTime(a.endsAt)
          : new Date(a.endsAt).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Africa/Accra",
            })}
      </p>
      <p className="text-sm text-muted-foreground">
        {a.customerName} · +{a.customerPhone}
      </p>
      <p className="text-sm">
        {a.fee === 0
          ? "Free"
          : `${estateMoney(a.fee, a.currency)} · ${a.paymentStatus === "REFUND_REQUIRED" || a.paymentStatus === "REFUNDED" ? refundLabel(a) : a.paymentStatus.toLowerCase()}`}
      </p>
      {a.status === "HOLD" && a.holdExpiresAt && (
        <p className="text-xs text-muted-foreground">
          Hold expires {estateTime(a.holdExpiresAt)}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {a.status === "HOLD" && !a.paymentUrl && (
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={async () => {
              setPending(true)
              const result = await retryEstatePayment(a.id)
              setPending(false)
              if (!result.ok) toast.error(result.error)
              else
                toast.success(
                  result.value.paymentUrl
                    ? "Payment link ready"
                    : `Appointment ${result.value.status.toLowerCase()}`
                )
            }}
          >
            Retry payment link
          </Button>
        )}
        {a.status === "HOLD" && a.paymentUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void navigator.clipboard.writeText(a.paymentUrl!).then(
                () => toast.success("Payment link copied"),
                () => toast.error("Could not copy payment link")
              )
            }}
          >
            Copy payment link
          </Button>
        )}
        {a.status === "CONFIRMED" && (
          <Button
            disabled={pending || +new Date(a.endsAt) > now}
            size="sm"
            variant="outline"
            onClick={() => void act("complete")}
          >
            Mark completed
          </Button>
        )}
        {(a.status === "CONFIRMED" || a.status === "HOLD") && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={pending} size="sm" variant="outline">
                Cancel appointment
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
                <AlertDialogDescription>
                  {`The calendar slot will become available.${a.paymentStatus === "PAID" ? " You can request the refund here in Acroma after cancelling." : ""} Let the buyer know about this change.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep unchanged</AlertDialogCancel>
                <AlertDialogAction onClick={() => void act("cancel")}>
                  Cancel appointment
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      {(a.paymentStatus === "REFUND_REQUIRED" ||
        a.paymentStatus === "REFUNDED") && (
        <AppointmentRefund appointment={a} />
      )}
    </article>
  )
}
