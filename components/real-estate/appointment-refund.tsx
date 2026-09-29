"use client"
import { useState } from "react"
import { toast } from "sonner"
import { estateMoney, estateTime, type Appointment } from "@/lib/real-estate"
import { refundLabel } from "@/lib/estate-refunds"
import { manageEstateRefund } from "@/lib/api/estate-refund-actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { RefundAccountForm } from "./refund-account-form"

export function AppointmentRefund({
  appointment: a,
}: {
  appointment: Appointment
}) {
  const [pending, setPending] = useState(false)
  const r = a.refund
  const needsSupport =
    r &&
    ["UNKNOWN", "FAILED", "REVIEW_REQUIRED", "NEEDS_ATTENTION"].includes(
      r.status
    )
  const message = !r
    ? a.paymentStatus === "REFUNDED"
      ? "This refund was manually recorded before refund tracking was available. Contact Acroma support to verify it."
      : "Request this refund through Acroma. The appointment has no reserved slot."
    : {
        REQUESTED: "Acroma is submitting the refund request.",
        UNKNOWN:
          "Acroma is checking whether the refund was accepted. Check its status before taking further action.",
        PENDING:
          "The payment provider has accepted the request. The refund is pending.",
        PROCESSING: "The payment provider is processing the refund.",
        NEEDS_ATTENTION:
          "The payment provider needs the customer’s bank details to finish this refund.",
        COMPLETED:
          "The payment provider has processed the refund. It may take up to 10 business days to appear in the customer’s account.",
        FAILED: r.canRetry
          ? "The payment could not be verified. No refund was submitted. You can retry the request."
          : "The payment provider reports that the refund failed. Contact Acroma support for help.",
        REVIEW_REQUIRED:
          "This payment needs review before a refund can proceed. Contact Acroma support with the refund ID below.",
      }[r.status]
  async function run(action: "request" | "refresh") {
    setPending(true)
    const result = await manageEstateRefund(a.id, action)
    setPending(false)
    if (!result.ok) toast.error(result.error)
    else toast.info(refundLabel(result.value))
  }
  return (
    <section
      aria-label="Appointment refund"
      className="space-y-3 border-t pt-4"
    >
      <Badge variant="secondary">{refundLabel(a)}</Badge>
      <p className="text-sm text-muted-foreground">{message}</p>
      {r?.completedAt && (
        <p className="text-xs">Processed {estateTime(r.completedAt)}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {a.paymentStatus === "REFUND_REQUIRED" && (!r || r.canRetry) && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" disabled={pending}>
                {r ? "Retry refund request" : "Request refund"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Refund {estateMoney(a.fee, a.currency)}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Acroma will request the full appointment fee back to the
                  customer’s payment method. This does not restore the booking.
                  You can follow the refund status here.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep unchanged</AlertDialogCancel>
                <AlertDialogAction onClick={() => void run("request")}>
                  Request refund
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {r && r.status !== "COMPLETED" && (
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => void run("refresh")}
          >
            {pending ? "Checking…" : "Check refund status"}
          </Button>
        )}
        {(needsSupport || (!r && a.paymentStatus === "REFUNDED")) && (
          <Button size="sm" variant="outline" asChild>
            <a
              href={`mailto:info@asera.tech?subject=${encodeURIComponent(`Acroma refund help: ${r?.id ?? a.id}`)}`}
            >
              Contact Acroma support
            </a>
          </Button>
        )}
      </div>
      {r?.status === "NEEDS_ATTENTION" && (
        <RefundAccountForm appointmentId={a.id} />
      )}
      {r && (
        <p className="text-xs break-all text-muted-foreground">
          Refund ID: {r.id}
        </p>
      )}
    </section>
  )
}
