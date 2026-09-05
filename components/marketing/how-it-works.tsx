import { STEPS } from "./content/sections"
import { Reveal } from "./reveal"
import { SectionHeading } from "./section-heading"

/**
 * The five beats between a customer message and an order on the board,
 * laid out as a rail so the whole path reads in one glance.
 */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 bg-background py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-6xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="Message in. Order out. Nothing in between for you to do."
          lede="Acroma sits on the number you already use. Your customers notice nothing new, except how fast you answer."
        />

        <ol className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step, index) => (
            <Reveal
              as="li"
              key={step.title}
              delay={index * 90}
              className="relative flex flex-col bg-card p-6"
            >
              <span className="mk-mono text-brand-orange">
                Step {String(index + 1).padStart(2, "0")}
              </span>
              <span
                aria-hidden
                className="mt-4 block h-px w-full bg-gradient-to-r from-brand-orange/40 to-transparent"
              />
              <h3 className="mt-4 text-[0.9375rem] font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
