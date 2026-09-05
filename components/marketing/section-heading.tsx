import { cn } from "@/lib/utils"

import { Reveal } from "./reveal"

type SectionHeadingProps = {
  eyebrow: string
  title: React.ReactNode
  lede?: React.ReactNode
  /** `dark` is for navy panels, `light` for paper and white ones. */
  tone?: "light" | "dark"
  align?: "start" | "center"
  className?: string
}

/** Mono eyebrow, display title, optional lede. The rhythm every section opens on. */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  tone = "light",
  align = "start",
  className,
}: SectionHeadingProps) {
  const dark = tone === "dark"

  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      <Reveal>
        <p
          className={cn(
            "mk-mono flex items-center gap-2.5 text-brand-orange",
            align === "center" && "justify-center"
          )}
        >
          <span aria-hidden className="h-px w-6 bg-brand-orange/50" />
          {eyebrow}
        </p>
      </Reveal>
      <Reveal delay={80}>
        <h2
          className={cn(
            "mk-title mt-5",
            dark ? "text-white" : "text-foreground"
          )}
        >
          {title}
        </h2>
      </Reveal>
      {lede ? (
        <Reveal delay={140}>
          <p
            className={cn(
              "mt-5 text-base leading-relaxed sm:text-lg",
              dark ? "text-white/65" : "text-muted-foreground"
            )}
          >
            {lede}
          </p>
        </Reveal>
      ) : null}
    </div>
  )
}
