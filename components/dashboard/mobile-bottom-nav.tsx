"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

type MobileBottomNavProps = {
  badges?: NavBadges;
  vocab: Vocabulary;
  name: string;
  email: string;
};

/**
 * Mobile primary navigation: a floating, dark capsule bar with four core tabs
 * plus a profile tab that opens the "More" drawer. Icon-led with an
 * active-state pill and dot badges. Floats above content (the scroll container
 * reserves space with bottom padding), the way modern native apps do.
 */
export function MobileBottomNav({
  badges,
  vocab,
  name,
  email,
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = React.useState(false);
  const items = getPrimaryNav(vocab);
  const moreActive = isSecondaryRoute(pathname);

  // Hide the bar inside a single conversation: that screen is a full-height
  // chat with its own composer pinned to the bottom (native in-thread pattern).
  if (/^\/dashboard\/conversations\/[^/]+$/.test(pathname)) return null;

  return (
    <>
      <nav
        aria-label="Primary"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 lg:hidden [padding-bottom:calc(env(safe-area-inset-bottom)+0.5rem)]"
      >
        <div className="bg-secondary pointer-events-auto flex w-full max-w-sm items-center gap-1 rounded-full p-2 shadow-[0_10px_34px_-10px_rgba(20,30,50,0.55)]">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(pathname, item.href);
            const badge = badges?.[item.href];
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-11 flex-1 items-center justify-center rounded-full transition-colors",
                  active ? "bg-white/15 text-white" : "text-white/55 hover:text-white",
                )}
              >
                <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                {badge && badge.count > 0 ? (
                  <span
                    aria-hidden
                    className={cn(
                      "ring-secondary absolute top-2 right-[1.1rem] size-2 rounded-full ring-2",
                      badge.tone === "waiting" ? "bg-brand-orange" : "bg-white",
                    )}
                  />
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
              "flex h-11 flex-1 items-center justify-center rounded-full transition-colors",
              moreActive ? "bg-white/15" : "hover:bg-white/10",
            )}
          >
            <Avatar className="size-7 ring-2 ring-white/25">
              <AvatarFallback className="bg-brand-orange text-primary-foreground text-[0.65rem] font-semibold">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </nav>

      <MobileMoreSheet
        open={moreOpen}
        onOpenChange={setMoreOpen}
        name={name}
        email={email}
      />
    </>
  );
}
