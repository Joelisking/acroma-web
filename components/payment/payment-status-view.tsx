import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { formatMoney } from "@/lib/format";
import type { PaymentStatusResult } from "@/lib/api/payment-status";

type Tone = "success" | "pending" | "error";

const TONE: Record<
  Tone,
  { ring: string; icon: typeof CheckCircle2 }
> = {
  success: { ring: "bg-brand-green-soft text-brand-green", icon: CheckCircle2 },
  pending: { ring: "bg-brand-orange-soft text-brand-orange", icon: Clock },
  error: { ring: "bg-destructive/10 text-destructive", icon: XCircle },
};

type View = {
  tone: Tone;
  title: string;
  body: string;
  amount?: { total: number; currency: string };
};

// Map the reconciled payment state to what the customer should see. The copy
// stays reassuring and vertical-neutral: whatever happens, the business will
// follow up on WhatsApp.
function resolveView(
  result: PaymentStatusResult | null,
  hasReference: boolean,
): View {
  if (!hasReference) {
    return {
      tone: "pending",
      title: "No payment reference",
      body: "We couldn’t find a payment reference in this link. If you just paid, give it a moment and refresh. The business will hear from us on WhatsApp either way.",
    };
  }
  if (!result || result.status === "unknown") {
    return {
      tone: "pending",
      title: "Still confirming…",
      body: "We’re waiting on confirmation from Paystack. You can close this tab. The business will reach out on WhatsApp shortly.",
    };
  }
  switch (result.status) {
    case "paid":
      return {
        tone: "success",
        title: "Payment received",
        body: "Thanks, we’ve got it. The business will reach out on WhatsApp shortly to confirm next steps.",
        amount: { total: result.totalAmount, currency: result.currency },
      };
    case "failed":
      return {
        tone: "error",
        title: "Payment didn’t go through",
        body: "Your card or wallet didn’t complete the charge. Reply on WhatsApp and we’ll send a fresh payment link.",
      };
    case "cancelled":
      return {
        tone: "error",
        title: "Order was cancelled",
        body: "This order is no longer active. Reply on WhatsApp to start a new one.",
      };
    default:
      return {
        tone: "pending",
        title: "Still processing",
        body: "Your payment is in flight. You can close this tab. We’ll message you on WhatsApp once it clears.",
      };
  }
}

export function PaymentStatusView({
  result,
  hasReference,
}: {
  result: PaymentStatusResult | null;
  hasReference: boolean;
}) {
  const view = resolveView(result, hasReference);
  const { ring, icon: Icon } = TONE[view.tone];

  return (
    <main className="bg-paper flex min-h-screen items-center justify-center px-6 py-12">
      <div className="card-warm w-full max-w-md overflow-hidden text-center">
        <div className="h-1.5 bg-brand-orange" />
        <div className="space-y-4 p-8">
          {/* Icon with a soft pulse ring on success */}
          <div className="relative mx-auto h-16 w-16">
            {view.tone === "success" && (
              <span
                className={`absolute inset-0 rounded-full ${ring} opacity-60 motion-safe:animate-ping`}
                aria-hidden
              />
            )}
            <div
              className={`relative flex h-16 w-16 items-center justify-center rounded-full ${ring}`}
            >
              <Icon className="h-8 w-8" aria-hidden />
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-brand-navy">
            {view.title}
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {view.body}
          </p>

          {view.amount && (
            <div className="bg-brand-green-soft mx-auto inline-flex flex-col rounded-2xl px-6 py-3">
              <span className="text-muted-foreground text-[0.7rem] font-semibold tracking-widest uppercase">
                Total paid
              </span>
              <span className="text-2xl font-bold tracking-tight text-brand-navy tabular-nums">
                {formatMoney(view.amount.total, view.amount.currency)}
              </span>
            </div>
          )}

          <p className="text-muted-foreground pt-2 text-[0.7rem] tracking-wide">
            Powered by{" "}
            <span className="font-bold text-brand-orange">Acroma</span>
          </p>
        </div>
      </div>
    </main>
  );
}
