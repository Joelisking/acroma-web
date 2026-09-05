"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"

import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

import type { NavLink } from "./content/nav"

type NavMenuProps = {
  links: NavLink[]
  signedIn: boolean
  /** Matches the header: the trigger is white until the bar turns solid. */
  stuck: boolean
}

/** The small-screen menu behind the header's hamburger. */
export function NavMenu({ links, signedIn, stuck }: NavMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          className={cn(
            "md:hidden",
            !stuck && "text-white hover:bg-white/10 hover:text-white"
          )}
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72 p-6">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <Logo tone="brand" className="h-7" />
        <ul className="mt-8 flex flex-col gap-1">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        {!signedIn && (
          <Button asChild variant="outline" size="xl" className="mt-6 w-full">
            <Link href="/login">Sign in</Link>
          </Button>
        )}
      </SheetContent>
    </Sheet>
  )
}
