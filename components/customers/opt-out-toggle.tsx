"use client";

import * as React from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { updateCustomerAction } from "@/lib/api/customers-actions";
import { useConfirmedAction } from "@/components/impersonation/use-confirmed-action";

export function OptOutToggle({
  id,
  optedOut,
}: {
  id: string;
  optedOut: boolean;
}) {
  const [pending, startTransition] = React.useTransition();
  const [value, setValue] = React.useState(optedOut);
  const confirm = useConfirmedAction();

  function onChange(next: boolean) {
    setValue(next);
    startTransition(async () => {
      const result = await confirm(
        {
          title: next
            ? "Opt customer out of broadcasts"
            : "Opt customer back in to broadcasts",
        },
        () => updateCustomerAction(id, { optedOut: next }),
      );
      if (!result) {
        // Admin cancelled (only possible while impersonating): revert.
        setValue(!next);
        return;
      }
      if (!result.ok) {
        toast.error(result.error);
        setValue(!next);
      } else {
        toast.success(next ? "Customer opted out" : "Customer opted in");
      }
    });
  }

  return (
    <Switch
      aria-label="Opt out of broadcasts"
      checked={value}
      onCheckedChange={onChange}
      disabled={pending}
    />
  );
}
