import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Vocabulary } from "@/lib/vocabulary"

type CatalogEmptyProps = {
  vocab: Vocabulary
}

export function CatalogEmpty({ vocab }: CatalogEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/60 py-20 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl text-2xl text-brand-orange">
        ✨
      </span>
      <p className="mt-5 font-display text-2xl font-medium tracking-tight text-foreground">
        Your {vocab.catalog.toLowerCase()} is empty.
      </p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Add your first {vocab.itemLower} so Acroma can answer questions, take
        orders, and update stock automatically.
      </p>
      <Button
        asChild
        className="mt-6 h-11 gap-2 rounded-xl bg-brand-orange px-5 hover:bg-brand-orange/90"
      >
        <Link href="/dashboard/catalog/new">
          <Plus />
          Add {vocab.itemLower}
        </Link>
      </Button>
    </div>
  )
}
