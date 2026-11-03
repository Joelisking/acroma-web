"use client"

import * as React from "react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { updateDeliveryFeeAction } from "@/lib/api/settings-actions"
import { useConfirmedAction } from "@/components/impersonation/use-confirmed-action"

type Props = {
  initial: number
  currency: string
}

/**
 * What the merchant charges to deliver. Applied to delivery orders rung up at
 * the till; chat orders are priced by the AI and are not charged it, so the
 * copy says so rather than letting the merchant assume otherwise.
 */
export function DeliveryFeeField({ initial, currency }: Props) {
  const [value, setValue] = React.useState(String(initial))
  const [saved, setSaved] = React.useState(initial)
  const [pending, startTransition] = React.useTransition()
  const confirm = useConfirmedAction()

  const parsed = Number.parseFloat(value)
  const valid = Number.isFinite(parsed) && parsed >= 0
  const dirty = valid && parsed !== saved

  function save() {
    if (!dirty) return
    startTransition(async () => {
      const result = await confirm(
        {
          title:
            parsed > 0
              ? `Set delivery charge to ${currency} ${parsed.toFixed(2)}`
              : "Make delivery free",
        },
        () => updateDeliveryFeeAction(parsed)
      )
      if (!result) return
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setSaved(parsed)
      toast.success(
        parsed > 0
          ? `Delivery now costs ${currency} ${parsed.toFixed(2)}`
          : "Delivery is now free"
      )
    })
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor="delivery-fee" className="text-sm font-medium">
        Delivery charge
      </Label>
      <p className="text-sm text-muted-foreground">
        Added to delivery orders rung up at the till. Set it to 0 if you deliver
        for free. Orders taken over WhatsApp are not charged it.
      </p>
      <div className="flex items-center gap-2 pt-1">
        <span className="text-sm font-medium text-muted-foreground">
          {currency}
        </span>
        <Input
          id="delivery-fee"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save()
          }}
          inputMode="decimal"
          autoComplete="off"
          className="h-10 max-w-28 tabular-nums"
          aria-invalid={!valid}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!dirty || pending}
          onClick={save}
        >
          Save
        </Button>
      </div>
      {!valid ? (
        <p className="text-sm text-destructive" role="alert">
          Enter an amount, or 0 for free delivery.
        </p>
      ) : null}
    </div>
  )
}
