"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { NAV_LINKS } from "./content/nav"
import { NavMenu } from "./nav-menu"

/**
 * Public header. Transparent over the navy hero, then settles onto a solid
 * bar once the reader has scrolled past it.
 */
export function SiteNav({ signedIn }: { signedIn: boolean }) {
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null)
  const [stuck, setStuck] = useState(false)

  const attach = useCallback((el: HTMLDivElement | null) => setSentinel(el), [])

  // A sentinel at the top of the document rather than a scroll listener: it
  // costs nothing per frame and is correct on a page that loads already
  // scrolled, such as a link straight to #pricing.
  useEffect(() => {
    if (!sentinel || typeof IntersectionObserver === "undefined") return

    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [sentinel])

  const cta = signedIn
    ? { href: "/dashboard", label: "Go to dashboard" }
    : { href: "/register", label: "Get started" }

  return (
    <>
      <div
        ref={attach}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 h-6 w-px"
      />
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          stuck
            ? "border-b border-border bg-background/90 backdrop-blur-md"
            : "border-b border-transparent"
        )}
      >
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-5 sm:h-18 lg:px-8">
          <Link href="/" aria-label="Acroma home" className="shrink-0">
            <Logo tone={stuck ? "brand" : "light"} className="h-6 sm:h-7" />
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={cn(
                    "text-sm transition-colors",
                    stuck
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-white/70 hover:text-white"
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {!signedIn && (
              <Button
                asChild
                size="lg"
                variant="ghost"
                className={cn(
                  "hidden sm:inline-flex",
                  !stuck && "text-white hover:bg-white/10 hover:text-white"
                )}
              >
                <Link href="/login">Sign in</Link>
              </Button>
            )}
            <Button asChild size="lg" className="rounded-lg">
              <Link href={cta.href}>{cta.label}</Link>
            </Button>

            <NavMenu links={NAV_LINKS} signedIn={signedIn} stuck={stuck} />
          </div>
        </nav>
      </header>
    </>
  )
}
