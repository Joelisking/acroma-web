import type { Metadata } from "next"
import { estatePaymentState } from "@/lib/api/real-estate"
import { AppointmentPaymentStatus } from "@/components/real-estate/appointment-payment-status"
export const metadata: Metadata = { title: "Appointment payment · Acroma" }
export const dynamic = "force-dynamic"
export default async function AppointmentPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>
}) {
  const sp = await searchParams
  const ref = sp.reference ?? sp.trxref
  const result = ref ? await estatePaymentState(ref).catch(() => null) : null
  return <AppointmentPaymentStatus result={result} />
}
