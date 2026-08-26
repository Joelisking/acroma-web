"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getSecondaryNav, isNavActive, type NavGroup } from "./nav-items";
import { getInitials } from "./account-menu";
import { logoutAction } from "@/lib/api/auth";
import { cn } from "@/lib/utils";
import type { AuthRole } from "@/lib/api/types";

/**
 * The mobile "More" drawer, opened from the profile tab on the bottom bar.
 * Holds the secondary destinations (Grow, Account) plus sign-out, so the
 * bottom bar stays at four core tabs. Modelled on the native account-drawer
 * pattern: profile header, grouped list rows, each closing the sheet on tap.
 */
export function MobileMoreSheet({
  open,
  onOpenChange,
  name,
  email,
  role,
  groups,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  email: string;
  role: AuthRole;
  /** Defaults to the full secondary nav (mobile); the tablet rail passes its
   *  own reduced set since it promotes some items into the rail itself. */
  groups?: NavGroup[];
}) {
  const pathname = usePathname();
  const navGroups = groups ?? getSecondaryNav(role);
  const [pending, startTransition] = React.useTransition();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        aria-describedby={undefined}
        className="border-border/70 max-h-[88svh] gap-0 overflow-y-auto rounded-t-3xl px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
      >
        <span
          aria-hidden
          className="bg-muted-foreground/25 mx-auto mb-3 h-1.5 w-10 rounded-full"
        />
        <SheetTitle className="sr-only">More</SheetTitle>

        <div className="bg-muted/60 flex items-center gap-3 rounded-2xl p-3">
          <Avatar className="size-11">
            <AvatarFallback className="bg-brand-orange text-primary-foreground font-semibold">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-foreground truncate font-semibold">{name}</p>
            <p className="text-muted-foreground truncate text-xs">{email}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-muted-foreground px-1 pb-1.5 text-xs font-semibold tracking-wide uppercase">
                {group.label}
              </p>
              <div className="border-border/70 bg-card overflow-hidden rounded-2xl border">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isNavActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => onOpenChange(false)}
                      className={cn(
                        "border-border/60 flex items-center gap-3 border-b px-3.5 py-3.5 transition-colors last:border-b-0",
                        active ? "bg-brand-orange-soft/60" : "active:bg-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-xl",
                          active
                            ? "bg-brand-orange text-primary-foreground"
                            : "bg-muted text-foreground",
                        )}
                      >
                        <Icon className="size-5" strokeWidth={2} />
                      </span>
                      <span className="text-foreground flex-1 text-[0.95rem] font-medium">
                        {item.label}
                      </span>
                      <ChevronRight className="text-muted-foreground/50 size-4" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          <Button
            variant="destructive"
            className="h-11 gap-2"
            disabled={pending}
            onClick={() => startTransition(() => void logoutAction())}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
