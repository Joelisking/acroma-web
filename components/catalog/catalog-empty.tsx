import Link from "next/link"
import { Plus } from "lucide-react"
import { LogoMark } from "@/components/brand/logo-mark"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import type { Vocabulary } from "@/lib/vocabulary"

type CatalogEmptyProps = {
  vocab: Vocabulary
}

export function CatalogEmpty({ vocab }: CatalogEmptyProps) {
  return (
    <EmptyState
      icon={LogoMark}
      title={`Your ${vocab.catalog.toLowerCase()} is empty.`}
      description={`Add your first ${vocab.itemLower} so Acroma can answer questions, take orders, and update stock automatically.`}
      action={
        <Button asChild className="h-11 gap-2">
          <Link href="/dashboard/catalog/new">
            <Plus />
            Add {vocab.itemLower}
          </Link>
        </Button>
      }
    />
  )
}
