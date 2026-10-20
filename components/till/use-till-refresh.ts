"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

const MIN_GAP_MS = 5_000
const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Keeps a till tablet that stays open all shift on today's prices: it
 * re-fetches the catalog when the screen comes back into view, and right when
 * a promotion starts or ends (any boundary under a day away).
 */
export function useTillRefresh(boundaries: (string | null | undefined)[]) {
  const router = useRouter()
  const last = React.useRef(0)

  React.useEffect(() => {
    function refresh() {
      if (document.visibilityState !== "visible") return
      const now = Date.now()
      if (now - last.current < MIN_GAP_MS) return
      last.current = now
      router.refresh()
    }
    window.addEventListener("focus", refresh)
    document.addEventListener("visibilitychange", refresh)
    return () => {
      window.removeEventListener("focus", refresh)
      document.removeEventListener("visibilitychange", refresh)
    }
  }, [router])

  const key = boundaries.filter(Boolean).join("|")
  React.useEffect(() => {
    const timers = key
      .split("|")
      .filter(Boolean)
      .map((iso) => new Date(iso).getTime() - Date.now())
      .filter((ms) => ms > 0 && ms < DAY_MS)
      .map((ms) => window.setTimeout(() => router.refresh(), ms + 1_000))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [router, key])
}
