"use client";

import * as React from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateAcceptsPickupAction } from "@/lib/api/settings-actions";

type Props = {
  initial: boolean;
};

export function AcceptPickupToggle({ initial }: Props) {
  const [enabled, setEnabled] = React.useState(initial);
  const [pending, startTransition] = React.useTransition();

  function onChange(next: boolean) {
    setEnabled(next);
    startTransition(async () => {
      const result = await updateAcceptsPickupAction(next);
      if (!result.ok) {
        toast.error(result.error);
        setEnabled(!next);
      } else {
        toast.success(next ? "Pickup enabled" : "Pickup disabled");
      }
    });
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <Label htmlFor="accept-pickup" className="text-sm font-medium">
          Accept pickup orders
        </Label>
        <p className="text-muted-foreground text-sm">
          Customers ordering on WhatsApp will be asked whether they want
          delivery or pickup. Pickup orders skip the address question.
        </p>
      </div>
      <Switch
        id="accept-pickup"
        checked={enabled}
        onCheckedChange={onChange}
        disabled={pending}
      />
    </div>
  );
}
