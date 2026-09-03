"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type CustomLineDialogProps = {
  open: boolean
  currency: string
  onOpenChange: (open: boolean) => void
  onAdd: (name: string, unitPrice: number) => void
}

/**
 * An off-catalog one-off. Any order carrying one of these is flagged for the
 * owner on the board, because the price was typed rather than taken from the
 * catalog.
 */
export function CustomLineDialog({
  open,
  currency,
  onOpenChange,
  onAdd,
}: CustomLineDialogProps) {
  const [name, setName] = React.useState("")
  const [price, setPrice] = React.useState("")

  const parsed = Number.parseFloat(price)
  const valid = name.trim().length > 0 && Number.isFinite(parsed) && parsed > 0

  function reset() {
    setName("")
    setPrice("")
  }

  function submit() {
    if (!valid) return
    onAdd(name.trim(), parsed)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Custom item</DialogTitle>
          <DialogDescription>
            For something not in your catalog. The owner sees which orders have
            a hand-typed price.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="custom-name">Item</Label>
            <Input
              id="custom-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sachet water"
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="custom-price">Price ({currency})</Label>
            <Input
              id="custom-price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="2.00"
              inputMode="decimal"
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === "Enter") submit()
              }}
            />
          </div>
          <Button type="button" disabled={!valid} onClick={submit}>
            Add to order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
