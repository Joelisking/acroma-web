"use client";

import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

type InfoSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accessible title; pass a node to render it visibly, else it's screen-reader only. */
  title: string;
  children: ReactNode;
};

/**
 * One panel, two presentations: a right-hand side panel from `md` up, and a
 * drag-friendly bottom sheet on mobile. Used for the conversation info panel so
 * the same content serves desktop and phone without a second component.
 */
export function InfoSheet({ open, onOpenChange, title, children }: InfoSheetProps) {
  const isWide = useMediaQuery("(min-width: 768px)");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isWide ? "right" : "bottom"}
        className={cn(
          "bg-paper overflow-y-auto p-0",
          isWide ? "w-[360px] sm:max-w-[360px]" : "h-[85vh] rounded-t-3xl",
        )}
      >
        <SheetTitle className="sr-only">{title}</SheetTitle>
        {children}
      </SheetContent>
    </Sheet>
  );
}
