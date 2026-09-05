"use client"

import { useCallback, useEffect, useState } from "react"

import { cn } from "@/lib/utils"

type RevealProps = {
  children: React.ReactNode
  /** Stagger, in milliseconds, applied once the element enters the viewport. */
  delay?: number
  className?: string
  /** Rendered element, so a revealed list item stays a list item. */
  as?: "div" | "li" | "figure"
}

/**
 * Settles its children into place the first time they scroll into view.
 * The displaced start state lives in `.mk-reveal`, which resolves to the
 * resting state under `prefers-reduced-motion`, so nothing is ever left
 * invisible for a reader who has motion turned off.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: RevealProps) {
  const [node, setNode] = useState<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  const attach = useCallback((el: HTMLElement | null) => setNode(el), [])

  useEffect(() => {
    if (!node || shown) return

    if (typeof IntersectionObserver === "undefined") {
      const fallback = setTimeout(() => setShown(true), 0)
      return () => clearTimeout(fallback)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true)
          observer.disconnect()
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [node, shown])

  const props = {
    ref: attach,
    "data-shown": shown,
    style: { "--mk-delay": `${delay}ms` } as React.CSSProperties,
    className: cn("mk-reveal", className),
    children,
  }

  if (as === "li") return <li {...props} />
  if (as === "figure") return <figure {...props} />
  return <div {...props} />
}
