import Link from "next/link"
import { ArrowRight, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { completeOnboardingAndConnectWhatsappAction } from "@/lib/api/onboarding-actions"

/**
 * Onboarding WhatsApp step. The Embedded Signup OAuth flow only supports a
 * mobile deep link today, so on web we route the merchant to the settings
 * flow where they select their merchant-owned account — or skip and connect later.
 *
 * Connecting marks onboarding complete on the way through, otherwise the
 * dashboard layout would bounce them back to /onboarding/step-1.
 */
export function WhatsappStep() {
  return (
    <div className="space-y-6">
      <ul className="card-warm divide-y divide-border/70 overflow-hidden">
        {[
          "Choose your WhatsApp business account",
          "Select the number you want to connect",
          "Acroma checks the connection before it starts replying",
        ].map((line, i) => (
          <li
            key={line}
            className="flex items-start gap-3 px-4 py-3.5 text-sm leading-relaxed"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-orange-soft text-xs font-semibold text-brand-orange">
              {i + 1}
            </span>
            <span className="text-foreground">{line}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/onboarding/step-4"
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Skip for now
        </Link>
        <form action={completeOnboardingAndConnectWhatsappAction}>
          <Button
            type="submit"
            className="h-11 gap-2 rounded-xl bg-brand-orange px-5 text-sm hover:bg-brand-orange/90"
          >
            <MessageCircle />
            Connect WhatsApp
            <ArrowRight />
          </Button>
        </form>
      </div>
    </div>
  )
}
