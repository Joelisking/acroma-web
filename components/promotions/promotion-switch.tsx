"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { updatePromotionAction } from "@/lib/api/promotions-actions"
import type { Promotion } from "@/lib/api/types"

/**
 * On/off for a promotion. Switching a live one off ends it (customers asking
 * for promo items are told it has ended), so that asks first.
 */
export function PromotionSwitch({ promotion }: { promotion: Promotion }) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()
  const [confirming, setConfirming] = React.useState(false)

  function set(isActive: boolean) {
    startTransition(async () => {
      const result = await updatePromotionAction(promotion.id, { isActive })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(isActive ? "Promotion switched on" : "Promotion ended")
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        id="promo-active"
        checked={promotion.isActive && promotion.status !== "ENDED"}
        disabled={pending}
        onCheckedChange={(on) => {
          if (!on && promotion.status === "LIVE") setConfirming(true)
          else set(on)
        }}
      />
      <Label htmlFor="promo-active" className="text-sm">
        {promotion.isActive && promotion.status !== "ENDED" ? "On" : "Off"}
      </Label>
      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End {promotion.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Promo prices stop straight away and promo items can no longer be
              ordered. Customers who ask for them will be told the promotion has
              ended. You can switch it back on later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it running</AlertDialogCancel>
            <AlertDialogAction onClick={() => set(false)}>
              End promotion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
