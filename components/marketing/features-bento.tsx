import { FEATURES } from "./content/features"
import { Reveal } from "./reveal"
import { SectionHeading } from "./section-heading"
import { cn } from "@/lib/utils"

const ICON_TONE = {
  orange: "bg-brand-orange-soft text-brand-orange",
  blue: "bg-brand-blue-soft text-brand-blue",
  green: "bg-brand-green-soft text-brand-green",
} as const

/**
 * Everything Acroma does, in an uneven grid. The two wide tiles carry the
 * headline capabilities; the rest fill in around them.
 */
export function FeaturesBento() {
  return (
    <section
      id="features"
      className="surface-grain scroll-mt-24 bg-paper py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-6xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="What you get"
          title="An assistant that sells, and a dashboard that keeps you in charge."
          lede="One handles the repetitive work of answering and collecting. The other makes sure you can see and change anything it does."
        />

        <div className="mt-16 grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Reveal
                key={feature.title}
                delay={(index % 3) * 80}
                className={cn(feature.wide && "sm:col-span-2")}
              >
                <article
                  className={cn(
                    "card-calm flex h-full flex-col p-6 transition-shadow duration-300 hover:shadow-[0_18px_40px_-28px_rgba(20,30,50,0.5)]",
                    feature.wide && "justify-center sm:p-8"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-xl",
                      ICON_TONE[feature.tone]
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <div className="mt-5">
                    <h3
                      className={cn(
                        "font-semibold tracking-tight",
                        feature.wide ? "text-lg sm:text-xl" : "text-[0.9375rem]"
                      )}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={cn(
                        "mt-2 leading-relaxed text-muted-foreground",
                        feature.wide ? "text-[0.9375rem]" : "text-sm"
                      )}
                    >
                      {feature.body}
                    </p>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
