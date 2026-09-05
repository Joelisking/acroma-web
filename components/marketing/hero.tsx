import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

import { HeroThread } from "./hero-thread"

const PROOF = ["No monthly fee", "1% when you get paid", "Keep your own number"]

export function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="surface-grain mk-grid mk-glow relative overflow-hidden bg-brand-navy pt-28 pb-24 sm:pt-36 lg:pt-40 lg:pb-36">
      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-16 px-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:px-8">
        <div>
          <p
            className="mk-rise mk-mono flex items-center gap-2.5 text-brand-orange"
            style={{ "--mk-delay": "40ms" } as React.CSSProperties}
          >
            <span aria-hidden className="h-px w-6 bg-brand-orange/50" />
            Commerce that runs on WhatsApp
          </p>

          <h1
            className="mk-rise mk-display mt-6 text-balance text-white"
            style={{ "--mk-delay": "120ms" } as React.CSSProperties}
          >
            Take orders on WhatsApp{" "}
            <span className="text-brand-orange">while you sleep</span>.
          </h1>

          <p
            className="mk-rise mt-7 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg"
            style={{ "--mk-delay": "220ms" } as React.CSSProperties}
          >
            Acroma answers your customers, takes the order, and collects payment
            on mobile money. Every order lands on one live dashboard, and you
            can step into any chat with one tap.
          </p>

          <div
            className="mk-rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ "--mk-delay": "320ms" } as React.CSSProperties}
          >
            <Button asChild size="xl" className="w-full sm:w-auto">
              <Link href={signedIn ? "/dashboard" : "/register"}>
                {signedIn ? "Go to dashboard" : "Get started"}
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="ghost"
              className="w-full border border-white/15 text-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>

          <ul
            className="mk-rise mt-9 flex flex-wrap items-center gap-x-6 gap-y-2"
            style={{ "--mk-delay": "420ms" } as React.CSSProperties}
          >
            {PROOF.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-xs text-white/55"
              >
                <span
                  aria-hidden
                  className="size-1 rounded-full bg-brand-orange"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="mk-rise lg:pr-10"
          style={{ "--mk-delay": "260ms" } as React.CSSProperties}
        >
          <HeroThread />
        </div>
      </div>
    </section>
  )
}
