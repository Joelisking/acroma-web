"use client";

import * as React from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateAcceptsCashOnDeliveryAction } from "@/lib/api/settings-actions";

type Props = {
  initial: boolean;
};

export function AcceptCodToggle({ initial }: Props) {
  const [enabled, setEnabled] = React.useState(initial);
  const [pending, startTransition] = React.useTransition();

  function onChange(next: boolean) {
    setEnabled(next);
    startTransition(async () => {
      const result = await updateAcceptsCashOnDeliveryAction(next);
      if (!result.ok) {
        toast.error(result.error);
        setEnabled(!next);
      } else {
        toast.success(
          next
            ? "Cash on delivery enabled"
            : "Cash on delivery disabled",
        );
      }
    });
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <Label htmlFor="accept-cod" className="text-sm font-medium">
          Accept cash on delivery
        </Label>
        <p className="text-muted-foreground text-sm">
          Customers ordering on WhatsApp will be asked whether to pay via
          mobile money or cash on delivery.
        </p>
      </div>
      <Switch
        id="accept-cod"
        checked={enabled}
        onCheckedChange={onChange}
        disabled={pending}
      />
    </div>
  );
}
