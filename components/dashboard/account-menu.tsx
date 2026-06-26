"use client";

import * as React from "react";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/api/auth";
import { cn } from "@/lib/utils";

type AccountMenuProps = {
  name: string;
  email: string;
  variant?: "compact" | "full";
};

export function AccountMenu({
  name,
  email,
  variant = "full",
}: AccountMenuProps) {
  const initials = getInitials(name);
  const [pending, startTransition] = React.useTransition();

  function onSignOut() {
    startTransition(() => {
      void logoutAction();
    });
  }

  return (
    <div
      className={cn(
        "border-border/70 bg-card flex items-center gap-3 rounded-xl border p-2.5",
        variant === "compact" && "border-transparent bg-transparent p-0",
      )}
    >
      <Avatar className="size-9">
        <AvatarFallback className="bg-brand-orange/15 text-brand-orange text-sm font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-sm font-medium">{name}</p>
        <p className="text-muted-foreground truncate text-xs">{email}</p>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Sign out"
        onClick={onSignOut}
        disabled={pending}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <LogOut />
      </Button>
    </div>
  );
}

export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "A";
}
