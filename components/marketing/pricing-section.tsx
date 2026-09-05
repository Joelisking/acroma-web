import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"

import { Button } from "@/components/ui/button"

import { Reveal } from "./reveal"
import { SectionHeading } from "./section-heading"

const NOT_CHARGED = [
  "No monthly subscription",
  "No setup fee",
  "Nothing on cash or counter orders",
]

export function PricingSection({ signedIn }: { signedIn: boolean }) {
  return (
    <section
      id="pricing"
      className="surface-grain scroll-mt-24 bg-paper py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-6xl px-5 lg:px-8">
        <SectionHeading
          align="center"
          eyebrow="Pricing"
          title="You pay when you get paid."
          lede="Two lines on the bill, and one of them only appears when money reaches you."
        />

        <Reveal delay={140} className="mt-14">
          <div className="card-calm mx-auto max-w-4xl overflow-hidden">
            <div className="grid sm:grid-cols-2">
              <div className="border-b border-border p-8 sm:border-r sm:border-b-0 sm:p-10">
                <p className="mk-mono text-muted-foreground">
                  On what you sell
                </p>
                <p className="mt-4 font-mono text-6xl font-semibold tracking-tight text-brand-orange">
                  1%
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Of every payment Acroma collects for you. Cash and walk-in
                  orders at the counter are not charged.
                </p>
              </div>

              <div className="p-8 sm:p-10">
                <p className="mk-mono text-muted-foreground">
                  On what it runs on
                </p>
                <p className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
                  AI usage,
                  <span className="block text-brand-blue">at cost</span>
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Acroma measures what every conversation costs to run and
                  passes it through with no markup. Billed in GHS.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6 border-t border-border bg-paper p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
              <ul className="flex flex-col gap-2.5">
                {NOT_CHARGED.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-sm text-foreground/80"
                  >
                    <Check className="size-4 shrink-0 text-brand-green" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild size="xl" className="shrink-0">
                <Link href={signedIn ? "/dashboard" : "/register"}>
                  {signedIn ? "Go to dashboard" : "Get started"}
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
