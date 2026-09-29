"use client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { estateTime, type Appointment } from "@/lib/real-estate"
export function AppointmentResult({
  created,
  onAnother,
}: {
  created: Appointment
  onAnother: () => void
}) {
  return (
    <div className="space-y-4" role="status">
      <h3 className="text-lg font-semibold">
        {created.status === "CONFIRMED"
          ? "Appointment confirmed"
          : created.status === "HOLD"
            ? "Awaiting payment"
            : `Appointment ${created.status.toLowerCase()}`}
      </h3>
      <p>{estateTime(created.startsAt)} · Ghana time</p>
      {created.status === "HOLD" && created.paymentUrl && (
        <>
          <p>
            Share this link with the buyer. The hold expires at{" "}
            {estateTime(created.holdExpiresAt!)}.
          </p>
          <Button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(created.paymentUrl!).then(
                () => toast.success("Payment link copied"),
                () => toast.error("Could not copy the payment link")
              )
            }}
          >
            Copy payment link
          </Button>
          <a
            className="block break-all text-primary underline"
            href={created.paymentUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open payment link
          </a>
        </>
      )}
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          onAnother()
        }}
      >
        Book another appointment
      </Button>
    </div>
  )
}
