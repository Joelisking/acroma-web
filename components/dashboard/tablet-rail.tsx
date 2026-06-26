"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  getPrimaryNav,
  isNavActive,
  isSecondaryRoute,
  type NavBadges,
} from "./nav-items";
import { getInitials } from "./account-menu";
import { MobileMoreSheet } from "./mobile-more-sheet";
import { cn } from "@/lib/utils";
import type { Vocabulary } from "@/lib/vocabulary";

type TabletRailProps = {
  badges?: NavBadges;
  vocab: Vocabulary;
  name: string;
  email: string;
};

/**
 * Tablet navigation: a slim labelled icon rail (md–lg only). Every destination
 * keeps its name under the icon so nothing relies on hover on a touch screen.
 * Secondary destinations live behind "More" (the same sheet the mobile bar
 * uses), keeping the rail to five clear, named items.
 */
export function TabletRail({ badges, vocab, name, email }: TabletRailProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = React.useState(false);
  const items = getPrimaryNav(vocab);
  const moreActive = isSecondaryRoute(pathname);

  return (
    <>
      <aside
        aria-label="Sidebar"
        className="bg-card border-border hidden w-20 shrink-0 flex-col items-center gap-1 border-r px-2 py-4 md:flex lg:hidden"
      >
        <Link
          href="/dashboard"
          aria-label="Acroma dashboard"
          className="bg-brand-orange text-primary-foreground mb-3 flex size-9 items-center justify-center rounded-xl text-lg font-extrabold"
        >
          a
        </Link>

        {items.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(pathname, item.href);
          const badge = badges?.[item.href];
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex w-full flex-col items-center gap-1 rounded-2xl py-2.5 transition-colors",
                active
                  ? "bg-brand-orange-soft text-brand-orange"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <Icon className="size-[1.3rem]" strokeWidth={active ? 2.3 : 1.9} />
              <span className="text-[0.625rem] leading-none font-semibold">{item.label}</span>
              {badge && badge.count > 0 ? (
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-1.5 right-3 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.55rem] font-bold tabular-nums",
                    badge.tone === "waiting"
                      ? "bg-brand-orange text-primary-foreground"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  {badge.count > 9 ? "9+" : badge.count}
                </span>
              ) : null}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-label="More"
          aria-expanded={moreOpen}
          className={cn(
            "flex w-full flex-col items-center gap-1 rounded-2xl py-2.5 transition-colors",
            moreActive
              ? "bg-brand-orange-soft text-brand-orange"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
          )}
        >
          <MoreHorizontal className="size-[1.3rem]" strokeWidth={moreActive ? 2.3 : 1.9} />
          <span className="text-[0.625rem] leading-none font-semibold">More</span>
        </button>

        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-label="Account"
          className="mt-auto rounded-full"
        >
          <Avatar className="ring-border size-9 ring-2">
            <AvatarFallback className="bg-brand-orange/15 text-brand-orange text-xs font-semibold">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </aside>

      <MobileMoreSheet
        open={moreOpen}
        onOpenChange={setMoreOpen}
        name={name}
        email={email}
      />
    </>
  );
}
