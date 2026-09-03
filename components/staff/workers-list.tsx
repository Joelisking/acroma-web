import type { Staff } from "@/lib/api/types"

import { AddWorkerDialog } from "./add-worker-dialog"
import { WorkerRow } from "./worker-row"

/** Active workers first, then deactivated ones, each group newest last. */
function ordered(staff: Staff[]): Staff[] {
  return [...staff].sort((a, b) => {
    const byStatus =
      Number(a.deactivatedAt !== null) - Number(b.deactivatedAt !== null)
    if (byStatus !== 0) return byStatus
    return a.createdAt.localeCompare(b.createdAt)
  })
}

export function WorkersList({
  staff,
  businessName,
}: {
  staff: Staff[]
  businessName: string
}) {
  const rows = ordered(staff)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {rows.length === 0
            ? "No workers yet."
            : `${rows.length} ${rows.length === 1 ? "worker" : "workers"}`}
        </p>
        <AddWorkerDialog businessName={businessName} />
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
          Add a worker and they get their own username and password. They get
          the till and today&apos;s orders, and their name sits on every action
          they take.
        </p>
      ) : (
        <ul className="divide-y divide-border/70">
          {rows.map((s) => (
            <WorkerRow key={s.id} staff={s} />
          ))}
        </ul>
      )}
    </div>
  )
}
