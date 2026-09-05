import { PROBLEMS } from "./content/sections"
import { Reveal } from "./reveal"
import { SectionHeading } from "./section-heading"

export function ProblemSection() {
  return (
    <section className="surface-grain bg-paper py-24 sm:py-32">
      <div className="mx-auto grid w-full max-w-6xl gap-14 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-8">
        <SectionHeading
          eyebrow="The problem"
          title={
            <>
              Every missed reply is a{" "}
              <span className="text-brand-orange">lost order</span>.
            </>
          }
          lede="Your customers message at all hours. You are the sales team, the catalog, the payment desk and the order book, all at the same time."
        />

        <ul className="lg:pt-2">
          {PROBLEMS.map((problem, index) => (
            <Reveal
              as="li"
              key={problem}
              delay={index * 70}
              className="group flex items-baseline gap-5 border-t border-border/70 py-5 last:border-b"
            >
              <span className="mk-mono w-6 shrink-0 text-brand-orange/70">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-base leading-relaxed text-foreground/85 sm:text-[1.0625rem]">
                {problem}
              </span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
