import { Check, ShieldCheck } from "lucide-react"

import type { ThreadEntry } from "./content/thread"
import { cn } from "@/lib/utils"

/** One message in the hero conversation. */
export function ThreadBubble({ entry }: { entry: ThreadEntry }) {
  const fromAcroma = entry.from === "acroma"

  return (
    <div
      className={cn(
        "mk-bubble-in flex w-full",
        fromAcroma ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[0.8125rem] leading-snug shadow-sm",
          fromAcroma
            ? "rounded-br-md border border-brand-orange/15 bg-brand-orange-soft text-foreground"
            : "rounded-bl-md border border-border bg-card text-foreground"
        )}
      >
        {entry.kind === "order" && entry.lines ? (
          <div className="mb-2.5 rounded-xl border border-border bg-card px-3 py-2.5">
            <p className="mk-mono text-muted-foreground">Order summary</p>
            <ul className="mt-2 space-y-1.5">
              {entry.lines.map((line) => (
                <li key={line.label} className="flex justify-between gap-4">
                  <span className="text-muted-foreground">{line.label}</span>
                  <span className="font-mono text-xs tabular-nums">
                    {line.value}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex justify-between gap-4 border-t border-border pt-2 font-medium">
              <span>Total</span>
              <span className="font-mono text-xs text-brand-orange tabular-nums">
                {entry.total}
              </span>
            </div>
          </div>
        ) : null}

        {entry.kind === "payment" ? (
          <div className="mb-2.5 flex items-center gap-2.5 rounded-xl border border-brand-blue/20 bg-brand-blue-soft px-3 py-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
              <ShieldCheck className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[0.8125rem] font-medium text-brand-blue">
                {entry.text}
              </span>
              <span className="mk-mono text-muted-foreground">
                Secured by Paystack
              </span>
            </span>
          </div>
        ) : null}

        {entry.kind === "paid" ? (
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-brand-green-soft px-2.5 py-1 text-[0.6875rem] font-semibold text-brand-green">
            <Check className="size-3" /> Payment received
          </span>
        ) : null}

        {entry.kind !== "payment" && entry.text ? <p>{entry.text}</p> : null}

        <p
          className={cn(
            "mt-1.5 font-mono text-[0.625rem] tabular-nums",
            fromAcroma ? "text-brand-orange/70" : "text-muted-foreground"
          )}
        >
          {entry.time}
        </p>
      </div>
    </div>
  )
}
