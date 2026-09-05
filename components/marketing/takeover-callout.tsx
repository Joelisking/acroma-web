import { ChevronsRight, Hand, Undo2 } from "lucide-react"

import { Reveal } from "./reveal"
import { SectionHeading } from "./section-heading"

const BEATS = [
  {
    icon: Hand,
    title: "Step in whenever",
    body: "Slide to take over and you are talking to your customer yourself, in the same chat.",
  },
  {
    icon: Undo2,
    title: "Hand it back",
    body: "When you are done, Acroma picks up exactly where you left it, with the full history.",
  },
]

/** The differentiator: the owner is never locked out of their own conversations. */
export function TakeoverCallout() {
  return (
    <section className="surface-grain mk-grid relative overflow-hidden bg-brand-navy py-24 sm:py-32">
      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-14 px-5 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-8">
        <div>
          <SectionHeading
            tone="dark"
            eyebrow="Human in the loop"
            title="You are always one tap away."
            lede="Acroma does the repetitive work, not the deciding. Every conversation is live on your dashboard, and it hands the difficult ones to you on its own."
          />

          <dl className="mt-10 grid gap-8 sm:grid-cols-2">
            {BEATS.map((beat, index) => (
              <Reveal key={beat.title} delay={index * 90}>
                <dt className="flex items-center gap-2.5 text-sm font-semibold text-white">
                  <beat.icon className="size-4 text-brand-orange" />
                  {beat.title}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-white/60">
                  {beat.body}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>

        <Reveal delay={120}>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8">
            <p className="mk-mono text-white/45">From your dashboard</p>
            <p className="mt-4 text-sm leading-relaxed text-white/75">
              &ldquo;The last one came out wrong, please can someone call
              me?&rdquo;
            </p>
            <p className="mk-mono mt-2 text-brand-orange">
              Acroma flagged this for you
            </p>

            <div
              aria-hidden
              className="mt-6 flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.06] py-2.5 pr-5 pl-2.5"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-brand-orange text-white">
                <ChevronsRight className="size-4" />
              </span>
              <span className="text-sm font-medium text-white/80">
                Slide to take over
              </span>
            </div>

            <p className="mt-4 text-xs text-white/40">
              The AI stops replying the moment you do.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
