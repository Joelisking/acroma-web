"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AuthCtaProps = {
  pending: boolean;
  children: React.ReactNode;
  className?: string;
};

/**
 * Tall primary CTA used on auth screens.
 * Inherits the brand orange from --primary; adds size + spinner state.
 */
export function AuthCta({ pending, children, className }: AuthCtaProps) {
  return (
    <Button
      type="submit"
      disabled={pending}
      className={cn(
        "h-12 w-full gap-2 rounded-xl text-[0.95rem] font-medium",
        "transition-transform active:scale-[0.99]",
        className,
      )}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </Button>
  );
}
