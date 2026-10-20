import type { ReactNode } from "react"

type Props = { title: string; description: string; children: ReactNode }

export function PromotionSection({ title, description, children }: Props) {
  return (
    <section className="card-warm space-y-4 p-5">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}
