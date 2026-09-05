import { ArrowUpRight } from "lucide-react"

import { TICKET_STAGES } from "./content/thread"
import { cn } from "@/lib/utils"

const TONE: Record<string, string> = {
  muted: "bg-muted text-muted-foreground",
  blue: "bg-brand-blue-soft text-brand-blue",
  orange: "bg-brand-orange-soft text-brand-orange",
  green: "bg-brand-green-soft text-brand-green",
}

/**
 * The dashboard card that keeps pace with the hero conversation, so the
 * reader sees the order appear on the owner's side as it is being placed.
 */
export function OrderTicket({ visible }: { visible: number }) {
  const stage =
    [...TICKET_STAGES].reverse().find((s) => visible >= s.minVisible) ??
    TICKET_STAGES[0]
  const priced = visible >= 4

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-4 shadow-[0_24px_60px_-30px_rgba(10,20,40,0.55)]">
      <div className="flex items-center justify-between gap-3">
        <p className="mk-mono text-muted-foreground">Your dashboard</p>
        <span className="flex items-center gap-1.5 text-[0.6875rem] font-medium text-brand-green">
          <span className="size-1.5 rounded-full bg-brand-green" />
          Live
        </span>
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs text-muted-foreground tabular-nums">
            #A-1042
          </p>
          <p className="mt-0.5 truncate text-sm font-medium">Ama Boateng</p>
          <p className="truncate text-xs text-muted-foreground">
            2 items, delivery to Osu
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold transition-colors duration-500",
            TONE[stage.tone]
          )}
        >
          {stage.status}
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3 border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">Order total</span>
        <span
          className={cn(
            "font-mono text-lg font-semibold tabular-nums transition-colors duration-500",
            priced ? "text-foreground" : "text-muted-foreground/40"
          )}
        >
          {priced ? "GHS 380" : "Pending"}
        </span>
      </div>

      <p className="mt-3 flex items-center gap-1 text-[0.6875rem] text-muted-foreground">
        Opened without you lifting a finger
        <ArrowUpRight className="size-3" />
      </p>
    </div>
  )
}
