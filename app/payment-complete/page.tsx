import type { Metadata } from "next";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { getPaymentStatus } from "@/lib/api/payment-status";
import { formatMoney } from "@/lib/format";

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

  if (!reference) {
    return (
      <Shell tone="pending" icon={<Clock className="h-7 w-7" />}>
        <h1 className="text-2xl font-semibold">No payment reference</h1>
        <p className="text-muted-foreground">
          We couldn&rsquo;t find a payment reference in this link. If you just
          paid, please give it a moment and refresh — the business will hear
          from us on WhatsApp either way.
        </p>
      </Shell>
    );
  }

  const result = await getPaymentStatus(reference).catch(() => null);

  if (!result || result.status === "unknown") {
    return (
      <Shell tone="pending" icon={<Clock className="h-7 w-7" />}>
        <h1 className="text-2xl font-semibold">Still confirming…</h1>
        <p className="text-muted-foreground">
          We&rsquo;re waiting on confirmation from Paystack. You can close this
          tab — the business will reach out on WhatsApp shortly.
        </p>
      </Shell>
    );
  }

  if (result.status === "paid") {
    return (
      <Shell tone="success" icon={<CheckCircle2 className="h-7 w-7" />}>
        <h1 className="text-2xl font-semibold">Payment received</h1>
        <p className="text-muted-foreground">
          Thanks — we&rsquo;ve got it. The business will reach out on WhatsApp
          shortly to confirm next steps.
        </p>
        <p className="pt-2 text-sm text-muted-foreground">
          Total paid:{" "}
          <span className="font-medium text-foreground">
            {formatMoney(result.totalAmount, result.currency)}
          </span>
        </p>
      </Shell>
    );
  }

  if (result.status === "failed") {
    return (
      <Shell tone="error" icon={<XCircle className="h-7 w-7" />}>
        <h1 className="text-2xl font-semibold">Payment didn&rsquo;t go through</h1>
        <p className="text-muted-foreground">
          Your card or wallet didn&rsquo;t complete the charge. Reply on
          WhatsApp and we&rsquo;ll send a fresh payment link.
        </p>
      </Shell>
    );
  }

  if (result.status === "cancelled") {
    return (
      <Shell tone="error" icon={<XCircle className="h-7 w-7" />}>
        <h1 className="text-2xl font-semibold">Order was cancelled</h1>
        <p className="text-muted-foreground">
          This order is no longer active. Reply on WhatsApp to start a new one.
        </p>
      </Shell>
    );
  }

  return (
    <Shell tone="pending" icon={<Clock className="h-7 w-7" />}>
      <h1 className="text-2xl font-semibold">Still processing</h1>
      <p className="text-muted-foreground">
        Your payment is in flight. You can close this tab — we&rsquo;ll
        message you on WhatsApp once it clears.
      </p>
    </Shell>
  );
}

function Shell({
  tone,
  icon,
  children,
}: {
  tone: "success" | "pending" | "error";
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const toneClasses =
    tone === "success"
      ? "bg-emerald-100 text-emerald-700"
      : tone === "error"
        ? "bg-rose-100 text-rose-700"
        : "bg-amber-100 text-amber-700";

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md space-y-4 text-center">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${toneClasses}`}
        >
          {icon}
        </div>
        {children}
      </div>
    </main>
  );
}
