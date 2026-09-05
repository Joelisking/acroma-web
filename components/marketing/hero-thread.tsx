"use client"

import { useEffect, useRef, useState } from "react"

import { useMediaQuery } from "@/hooks/use-media-query"

import { THREAD } from "./content/thread"
import { OrderTicket } from "./order-ticket"
import { ThreadBubble } from "./thread-bubble"

const CUSTOMER_PAUSE = 1150
const ACROMA_PAUSE = 1500
const RESTART_PAUSE = 5600

/**
 * The hero conversation, played out one message at a time and looped.
 * Readers who prefer reduced motion get the finished thread immediately,
 * with no timers running at all.
 */
export function HeroThread() {
  const still = useMediaQuery("(prefers-reduced-motion: reduce)")
  const [step, setStep] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)

  const visible = still ? THREAD.length : step
  const typing =
    !still && step < THREAD.length && THREAD[step].from === "acroma"

  useEffect(() => {
    if (still) return

    if (step >= THREAD.length) {
      const restart = setTimeout(() => setStep(0), RESTART_PAUSE)
      return () => clearTimeout(restart)
    }

    const pause = THREAD[step].from === "acroma" ? ACROMA_PAUSE : CUSTOMER_PAUSE
    const tick = setTimeout(() => setStep((count) => count + 1), pause)
    return () => clearTimeout(tick)
  }, [step, still])

  useEffect(() => {
    const node = scroller.current
    if (node) node.scrollTop = node.scrollHeight
  }, [visible, typing])

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-background shadow-[0_50px_120px_-40px_rgba(0,0,0,0.75)]">
        <div className="flex items-center gap-3 border-b border-border bg-paper px-4 py-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-brand-navy text-xs font-semibold text-white">
            AB
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Ama Boateng</p>
            <p className="mk-mono text-muted-foreground">WhatsApp</p>
          </div>
          <span className="rounded-full bg-brand-orange-soft px-2.5 py-1 text-[0.6875rem] font-semibold text-brand-orange">
            Acroma replying
          </span>
        </div>

        <div
          ref={scroller}
          aria-live="polite"
          className="flex h-[26rem] flex-col gap-2.5 overflow-hidden bg-paper px-4 py-4 sm:h-[28rem]"
        >
          {THREAD.slice(0, visible).map((entry) => (
            <ThreadBubble key={entry.id} entry={entry} />
          ))}

          {typing ? (
            <div className="mk-bubble-in flex justify-end">
              <div className="flex items-center gap-1 rounded-2xl rounded-br-md border border-brand-orange/15 bg-brand-orange-soft px-3.5 py-3">
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className="mk-dot size-1.5 rounded-full bg-brand-orange"
                    style={{ animationDelay: `${dot * 160}ms` }}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 sm:absolute sm:-right-6 sm:-bottom-10 sm:mt-0 sm:w-64 lg:-right-16 lg:w-72">
        <OrderTicket visible={visible} />
      </div>
    </div>
  )
}
