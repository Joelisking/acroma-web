"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  createPromotionAction,
  updatePromotionAction,
} from "@/lib/api/promotions-actions"
import type { Promotion, PromotionMenuMode } from "@/lib/api/types"
import { fromPickerValue, toPickerValue } from "@/lib/promotions"
import { MenuModePicker } from "./menu-mode-picker"

type Props = { existing?: Promotion }

/** Name, note, menu mode and optional dates. Create mode opens the new promotion. */
export function PromotionForm({ existing }: Props) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()
  const [name, setName] = React.useState(existing?.name ?? "")
  const [description, setDescription] = React.useState(
    existing?.description ?? ""
  )
  const [menuMode, setMenuMode] = React.useState<PromotionMenuMode>(
    existing?.menuMode ?? "ALONGSIDE"
  )
  const [startsAt, setStartsAt] = React.useState(
    toPickerValue(existing?.startsAt ?? null)
  )
  const [endsAt, setEndsAt] = React.useState(
    toPickerValue(existing?.endsAt ?? null)
  )

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Give the promotion a name")
      return
    }
    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      menuMode,
      startsAt: fromPickerValue(startsAt),
      endsAt: fromPickerValue(endsAt),
    }
    startTransition(async () => {
      const result = existing
        ? await updatePromotionAction(existing.id, payload)
        : await createPromotionAction(payload)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(existing ? "Promotion saved" : "Promotion created")
      if (existing) router.refresh()
      else router.push(`/dashboard/promotions/${result.data.id}`)
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="promo-name">Name</Label>
        <Input
          id="promo-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Meal Promo"
          maxLength={80}
          disabled={pending}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="promo-description">Note (optional)</Label>
        <Textarea
          id="promo-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="For your team. Customers don't see this."
          maxLength={500}
          disabled={pending}
        />
      </div>
      <div className="space-y-2">
        <Label>Menu</Label>
        <MenuModePicker
          value={menuMode}
          onChange={setMenuMode}
          disabled={pending}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="promo-starts">Starts (optional)</Label>
          <DateTimePicker
            id="promo-starts"
            value={startsAt}
            onChange={setStartsAt}
            disabled={pending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="promo-ends">Ends (optional)</Label>
          <DateTimePicker
            id="promo-ends"
            value={endsAt}
            onChange={setEndsAt}
            disabled={pending}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Leave the dates empty to run it only while it&apos;s switched on.
      </p>
      <Button type="submit" disabled={pending} className="h-10 rounded-xl px-5">
        {existing ? "Save details" : "Create promotion"}
      </Button>
    </form>
  )
}
