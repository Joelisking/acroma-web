import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shown on the overview when WhatsApp isn't connected yet.
 * The single most important next step for a fresh merchant.
 */
export function SetupCallout() {
  return (
    <section
      className="surface-grain border-secondary/15 bg-secondary text-secondary-foreground relative overflow-hidden rounded-2xl border p-6 sm:p-8"
      aria-labelledby="setup-heading"
    >
      <div
        aria-hidden
        className="bg-brand-orange/35 absolute -top-16 -right-16 size-56 rounded-full blur-3xl"
      />
      <div className="relative grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="max-w-xl">
          <p className="eyebrow text-brand-orange">Get started</p>
          <h2
            id="setup-heading"
            className="font-display mt-3 text-2xl leading-tight font-medium tracking-tight sm:text-3xl"
          >
            Connect WhatsApp to start taking orders.
          </h2>
          <p className="text-secondary-foreground/70 mt-3 text-sm">
            Link your WhatsApp Business number and Acroma will start replying,
            taking orders, and collecting payments, within minutes.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="bg-brand-orange hover:bg-brand-orange/90 h-12 self-start rounded-xl px-5 text-[0.95rem] sm:self-center"
        >
          <Link href="/dashboard/settings">
            <MessageCircle />
            Connect WhatsApp
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}
