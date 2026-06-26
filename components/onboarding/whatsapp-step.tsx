import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeOnboardingAndConnectWhatsappAction } from "@/lib/api/onboarding-actions";

/**
 * Onboarding WhatsApp step. The Embedded Signup OAuth flow only supports a
 * mobile deep link today, so on web we route the merchant to the settings
 * page where they can paste credentials manually — or skip and connect later.
 *
 * Connecting marks onboarding complete on the way through, otherwise the
 * dashboard layout would bounce them back to /onboarding/step-1.
 */
export function WhatsappStep() {
  return (
    <div className="space-y-6">
      <ul className="card-warm divide-border/70 divide-y overflow-hidden">
        {[
          "Open Meta Business Manager and grab your WhatsApp credentials",
          "Paste them into the Settings → WhatsApp page",
          "Acroma immediately starts replying to messages",
        ].map((line, i) => (
          <li
            key={line}
            className="flex items-start gap-3 px-4 py-3.5 text-sm leading-relaxed"
          >
            <span className="bg-brand-orange-soft text-brand-orange flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
              {i + 1}
            </span>
            <span className="text-foreground">{line}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/onboarding/step-4"
          className="text-muted-foreground hover:text-foreground text-sm font-medium underline-offset-4 hover:underline"
        >
          Skip for now
        </Link>
        <form action={completeOnboardingAndConnectWhatsappAction}>
          <Button
            type="submit"
            className="bg-brand-orange hover:bg-brand-orange/90 h-11 gap-2 rounded-xl px-5 text-sm"
          >
            <MessageCircle />
            Connect WhatsApp
            <ArrowRight />
          </Button>
        </form>
      </div>
    </div>
  );
}
