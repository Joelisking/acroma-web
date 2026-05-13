"use client";

import * as React from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { updateCustomerAction } from "@/lib/api/customers-actions";

export function OptOutToggle({
  id,
  optedOut,
}: {
  id: string;
  optedOut: boolean;
}) {
  const [pending, startTransition] = React.useTransition();
  const [value, setValue] = React.useState(optedOut);

  function onChange(next: boolean) {
    setValue(next);
    startTransition(async () => {
      const result = await updateCustomerAction(id, { optedOut: next });
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
