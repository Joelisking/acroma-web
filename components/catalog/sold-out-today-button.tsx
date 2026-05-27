"use client";

import * as React from "react";
import { Loader2, RotateCcw, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
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
 * One-click toggle the merchant uses to flag a product as "finished for
 * today" or to bring it back. Auto-clears on the next UTC day boundary
 * backend-side, so this is intentionally just a manual switch.
 */
export function SoldOutTodayButton({ productId, soldOutAt }: Props) {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  // Compute on first render so the UI matches the SSR'd state; the action
  // result will revalidate the page and refresh the underlying timestamp.
  const isSoldOut = isSoldOutToday(soldOutAt);

  function onClick() {
    setError(null);
    startTransition(async () => {
      const action = isSoldOut
        ? clearSoldOutTodayAction
        : markSoldOutTodayAction;
      const res = await action(productId);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant={isSoldOut ? "default" : "outline"}
        size="sm"
        onClick={onClick}
        disabled={pending}
        className="gap-1.5"
      >
        {pending ? (
          <Loader2 className="animate-spin" />
        ) : isSoldOut ? (
          <RotateCcw />
        ) : (
          <UtensilsCrossed />
        )}
        {isSoldOut ? "Bring back" : "Mark sold out for today"}
      </Button>
      {error ? (
        <p className="text-destructive text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
