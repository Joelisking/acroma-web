import { QUOTE, STATS } from "./content/sections"
import { Reveal } from "./reveal"

/**
 * Market and validation numbers, plus the line from the interview that made
 * the case better than any of them. Doubles as the investor-facing beat.
 */
export function ProofStrip() {
  return (
    <section className="bg-background py-24 sm:py-32">
      <div className="mx-auto w-full max-w-6xl px-5 lg:px-8">
        <dl className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, index) => (
            <Reveal
              key={stat.figure}
              delay={index * 80}
              className="bg-card p-6 sm:p-7"
            >
              <dt className="font-mono text-3xl font-semibold tracking-tight text-brand-orange tabular-nums sm:text-4xl">
                {stat.figure}
              </dt>
              <dd className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {stat.label}
              </dd>
            </Reveal>
          ))}
        </dl>

        <Reveal as="figure" delay={120} className="mt-14 lg:mt-16">
          <blockquote className="mx-auto max-w-3xl text-center">
            <p className="text-xl leading-snug font-medium tracking-tight text-balance sm:text-2xl">
              <span className="text-brand-orange">&ldquo;</span>
              {QUOTE.text}
              <span className="text-brand-orange">&rdquo;</span>
            </p>
          </blockquote>
          <figcaption className="mt-7 text-center">
            <span className="text-sm font-medium">{QUOTE.attribution}</span>
            <span className="mk-mono mt-1 block text-muted-foreground">
              {QUOTE.context}
            </span>
          </figcaption>
        </Reveal>
      </div>
    </section>
  )
}
