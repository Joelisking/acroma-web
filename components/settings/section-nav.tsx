"use client"

import { useId } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { settingsSectionsFor } from "./settings-sections"
import type { AuthRole, BusinessType } from "@/lib/api/types"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SectionNav({
  role,
  businessType,
}: {
  role: AuthRole
  businessType?: BusinessType
}) {
  const pathname = usePathname()
  const router = useRouter()
  const selectId = useId()
  const sections = settingsSectionsFor(role, businessType)
  const activeSection = sections.find(
    (s) => pathname === s.href || pathname.startsWith(s.href + "/")
  )
  const ActiveIcon = activeSection?.icon

  return (
    <nav aria-label="Settings sections" className="min-w-0">
      <div className="lg:hidden">
        <Label htmlFor={selectId} className="sr-only">
          Settings section
        </Label>
        <Select
          value={activeSection?.href ?? ""}
          onValueChange={(href) => router.push(href)}
        >
          <SelectTrigger
            id={selectId}
            className="w-full max-w-sm min-w-0 gap-3 rounded-xl border-border bg-card px-3 py-3 text-left shadow-sm hover:border-primary/40 data-[size=default]:h-auto data-[state=open]:border-primary/50"
          >
            <span className="flex min-w-0 flex-1 items-center gap-3">
              {ActiveIcon && (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                  <ActiveIcon className="size-4" strokeWidth={1.75} />
                </span>
              )}
              <span className="min-w-0">
                <span className="mb-0.5 block text-xs font-normal text-muted-foreground">
                  Settings
                </span>
                <SelectValue placeholder="Choose a section">
                  <span className="block truncate font-medium">
                    {activeSection?.label}
                  </span>
                </SelectValue>
              </span>
            </span>
          </SelectTrigger>
          <SelectContent
            position="popper"
            align="start"
            className="rounded-xl p-1"
          >
            <SelectGroup className="space-y-1">
              {sections.map((s) => {
                const Icon = s.icon
                return (
                  <SelectItem
                    key={s.href}
                    value={s.href}
                    textValue={s.label}
                    className="min-h-11 rounded-lg px-3 pr-9 data-[state=checked]:bg-accent data-[state=checked]:font-medium data-[state=checked]:text-accent-foreground"
                  >
                    <Icon
                      className="size-4 text-muted-foreground"
                      strokeWidth={1.75}
                    />
                    {s.label}
                  </SelectItem>
                )
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="hidden flex-col gap-1 lg:flex">
        {sections.map((s) => {
          const active =
            pathname === s.href || pathname.startsWith(s.href + "/")
          const Icon = s.icon
          return (
            <Link
              key={s.href}
              href={s.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" strokeWidth={1.75} />
              <span>{s.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
