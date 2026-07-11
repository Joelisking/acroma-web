import type { Metadata } from "next";
import { getPaymentStatus } from "@/lib/api/payment-status";
import { PaymentStatusView } from "@/components/payment/payment-status-view";

export const metadata: Metadata = { title: "Payment status · Acroma" };

// Paystack appends ?reference=… (and a few aliases) when redirecting back.
// Treat the page as fully dynamic so we always re-check on landing.
export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  reference?: string | string[];
  trxref?: string | string[];
}>;

function pickReference(sp: Awaited<SearchParams>): string | undefined {
  const value = sp.reference ?? sp.trxref;
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function PaymentCompletePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const reference = pickReference(sp);

  const result = reference
    ? await getPaymentStatus(reference).catch(() => null)
    : null;

  return (
    <PaymentStatusView result={result} hasReference={Boolean(reference)} />
  );
}
