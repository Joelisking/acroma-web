"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { estateTime, type PaymentState } from "@/lib/real-estate"
import { customerRefundMessage, refundLabels } from "@/lib/estate-refunds"
export function AppointmentPaymentStatus({
  result,
}: {
  result: PaymentState | null
}) {
  const router = useRouter()
  useEffect(() => {
    if (result?.status !== "HOLD") return
    const timer = window.setInterval(() => router.refresh(), 10000)
    return () => clearInterval(timer)
  }, [result?.status, router])
  const confirmed =
    result?.status === "CONFIRMED" || result?.status === "COMPLETED"
  const refund =
    result?.paymentStatus === "REFUND_REQUIRED" ||
    result?.paymentStatus === "REFUNDED"
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-4 rounded-2xl border bg-card p-8">
        <p className="font-semibold text-primary">Acroma</p>
        <h1 className="text-2xl font-semibold">
          {confirmed
            ? "Appointment confirmed"
            : refund
              ? result?.refundStatus
                ? refundLabels[result.refundStatus]
                : "Contact your agency"
              : result?.status === "HOLD"
                ? "Checking your payment"
                : result
                  ? "Appointment not confirmed"
                  : "Unable to verify payment"}
        </h1>
        <p className="text-muted-foreground">
          {confirmed
            ? `Your appointment is booked for ${estateTime(result!.startsAt)} (Ghana time). Return to your WhatsApp chat for property details.`
            : refund
              ? customerRefundMessage(result!)
              : result?.status === "HOLD"
                ? "Your slot is temporarily held. This page will update after payment is verified."
                : "Return to the agency on WhatsApp to check the payment or choose another available time."}
        </p>
        {!confirmed && (
          <Button variant="outline" onClick={() => router.refresh()}>
            Check again
          </Button>
        )}
      </div>
    </main>
  )
}
