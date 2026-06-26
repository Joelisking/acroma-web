import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { WhatsappGuide } from "@/components/settings/whatsapp-guide";

export const metadata: Metadata = {
  title: "WhatsApp setup guide · Settings · Acroma",
};

export default function WhatsappGuidePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <Link
          href="/dashboard/settings/whatsapp"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to WhatsApp settings
        </Link>
        <header className="space-y-2">
          <p className="text-brand-orange text-xs font-bold tracking-widest uppercase">
            Setup guide
          </p>
          <h1 className="text-foreground text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
            Where to find your WhatsApp credentials
          </h1>
          <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
            Acroma needs three values from Meta&apos;s WhatsApp Cloud API:
            your phone number ID, your business account ID, and a permanent
            access token. Here&apos;s exactly where each one lives.
          </p>
        </header>
      </div>

      <WhatsappGuide />
    </div>
  );
}
