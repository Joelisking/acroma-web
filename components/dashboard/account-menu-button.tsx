"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { AccountMenu, getInitials } from "./account-menu";

type AccountMenuButtonProps = {
  name: string;
  email: string;
  className?: string;
};

/**
 * Compact avatar trigger that opens the account block (with sign out) in a
 * popover. Lives in the mobile top bar, where the desktop sidebar — and the
 * account menu it carries — is hidden.
 */
export function AccountMenuButton({
  name,
  email,
  className,
}: AccountMenuButtonProps) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="Account"
        className={cn(
          "focus-visible:ring-ring/50 rounded-full outline-none focus-visible:ring-3",
          className,
        )}
      >
        <Avatar className="size-8">
          <AvatarFallback className="bg-brand-orange/15 text-brand-orange font-display text-xs font-medium">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <AccountMenu name={name} email={email} variant="compact" />
      </PopoverContent>
    </Popover>
  );
}
