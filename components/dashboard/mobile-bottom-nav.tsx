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
  const shrunk = useScrollShrink();
  const items = getPrimaryNav(vocab);
  const moreActive = isSecondaryRoute(pathname);

  return (
    <>
      <nav
        aria-label="Primary"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 lg:hidden [padding-bottom:calc(env(safe-area-inset-bottom)+1.25rem)]"
      >
        <div
          className={cn(
            "bg-secondary pointer-events-auto flex w-full max-w-sm origin-bottom items-center gap-1 rounded-full p-2 shadow-[0_10px_34px_-10px_rgba(20,30,50,0.55)] transition-transform duration-300 ease-out",
            shrunk ? "translate-y-1 scale-90" : "translate-y-0 scale-100",
          )}
        >
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

/**
 * True while the user is scrolling down the dashboard scroll container, so the
 * floating bar can shrink and tuck out of the way; restores near the top and
 * when scrolling back up. rAF-throttled and passive — no scroll jank.
 */
function useScrollShrink(): boolean {
  const [shrunk, setShrunk] = React.useState(false);

  React.useEffect(() => {
    const el = document.getElementById("dashboard-scroll");
    if (!el) return;
    let lastY = el.scrollTop;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = el.scrollTop;
        if (y < 24) setShrunk(false);
        else if (y - lastY > 6) setShrunk(true);
        else if (lastY - y > 6) setShrunk(false);
        lastY = y;
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return shrunk;
}
