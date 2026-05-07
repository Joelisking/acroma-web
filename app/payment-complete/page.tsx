import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = { title: "Payment received · Acroma" };

export default function PaymentCompletePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-semibold">Payment received</h1>
        <p className="text-muted-foreground">
          Thank you — you can close this tab. The business will reach out on
          WhatsApp shortly.
        </p>
      </div>
    </main>
  );
}
