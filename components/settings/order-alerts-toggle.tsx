"use client";

import * as React from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateOrderAlertsEnabledAction } from "@/lib/api/settings-actions";

type Props = {
  initial: boolean;
};

// Single opt-out for the "order coming in" merchant alert that fires right
// before CREATE_ORDER persists. Useful for food merchants pre-staging the
// kitchen; can be flipped off if the signal turns noisy.
export function OrderAlertsToggle({ initial }: Props) {
  const [enabled, setEnabled] = React.useState(initial);
  const [pending, startTransition] = React.useTransition();

  function onChange(next: boolean) {
    setEnabled(next);
    startTransition(async () => {
      const result = await updateOrderAlertsEnabledAction(next);
      if (!result.ok) {
        toast.error(result.error);
        setEnabled(!next);
      } else {
        toast.success(next ? "Order alerts enabled" : "Order alerts disabled");
      }
    });
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <Label htmlFor="order-alerts" className="text-sm font-medium">
          Alert me when an order is about to be placed
        </Label>
        <p className="text-muted-foreground text-sm">
          Get a heads-up push the moment a customer is mid-order, before
          they pay. Useful for kitchens pre-staging food.
        </p>
      </div>
      <Switch
        id="order-alerts"
        checked={enabled}
        onCheckedChange={onChange}
        disabled={pending}
      />
    </div>
  );
}
