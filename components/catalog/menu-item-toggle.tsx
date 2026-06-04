"use client";

import * as React from "react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import {
  clearSoldOutTodayAction,
  markSoldOutTodayAction,
} from "@/lib/api/products-actions";
import { isSoldOutToday } from "@/lib/catalog/sold-out";

type Props = {
  productId: string;
  soldOutAt: string | null;
};

/**
 * Inline availability switch on the menu list. On = available (green),
 * off = sold out for today. Auto-clears at the next day boundary backend-side,
 * so this is just a manual same-day flag. Reuses the existing sold-out actions
 * (no contract change); the action revalidates the page on success.
 */
export function MenuItemToggle({ productId, soldOutAt }: Props) {
  const [pending, startTransition] = React.useTransition();
  const available = !isSoldOutToday(soldOutAt);

  function onCheckedChange(nextAvailable: boolean) {
    startTransition(async () => {
      const action = nextAvailable
        ? clearSoldOutTodayAction
        : markSoldOutTodayAction;
      const res = await action(productId);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(
        nextAvailable ? "Back on the menu" : "Marked sold out for today",
      );
    });
  }

  return (
    <Switch
      checked={available}
      onCheckedChange={onCheckedChange}
      disabled={pending}
      aria-label={
        available ? "Mark sold out for today" : "Bring back on the menu"
      }
      className="data-checked:bg-brand-green"
    />
  );
}
