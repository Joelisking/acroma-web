"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markOrdersPaidAction } from "@/lib/api/orders-actions";

export function OrdersBulkBar({
  selectedIds,
  onClear,
}: {
  selectedIds: string[];
  onClear: () => void;
}) {
  const [pending, startTransition] = React.useTransition();

  if (selectedIds.length === 0) return null;

  function markPaid() {
    startTransition(async () => {
      const result = await markOrdersPaidAction(selectedIds);
      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success(
          `Marked ${selectedIds.length} ${selectedIds.length === 1 ? "booking" : "bookings"} as paid`,
        );
        onClear();
      }
    });
  }

  return (
    <div
      className="bg-card border-border fixed inset-x-0 bottom-0 z-20 border-t p-3 shadow-lg sm:left-auto sm:right-6 sm:bottom-6 sm:rounded-xl sm:border"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 sm:max-w-none">
        <span className="text-foreground text-sm font-medium">
          {selectedIds.length} selected
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            disabled={pending}
          >
            Clear
          </Button>
          <Button size="sm" onClick={markPaid} disabled={pending}>
            Mark as paid
          </Button>
        </div>
      </div>
    </div>
  );
}
