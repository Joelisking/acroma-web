"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAmount: number;
  currency: string;
  pending?: boolean;
  onConfirm: (amount: number) => void;
};

type FormProps = Pick<Props, "defaultAmount" | "currency" | "pending" | "onConfirm"> & {
  onCancel: () => void;
};

function MarkPaidForm({
  defaultAmount,
  currency,
  pending,
  onConfirm,
  onCancel,
}: FormProps) {
  const [value, setValue] = React.useState(String(defaultAmount));

  const amount = Number(value);
  const valid = value.trim() !== "" && Number.isFinite(amount) && amount >= 0;

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="paid-amount">Amount collected ({currency})</Label>
        <Input
          id="paid-amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min={0}
          autoFocus
          className="h-11 tabular-nums"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <p className="text-muted-foreground text-xs">
          Defaults to the booked total. Edit it if the customer paid a
          different amount.
        </p>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button disabled={!valid || pending} onClick={() => onConfirm(amount)}>
          Mark as paid
        </Button>
      </DialogFooter>
    </>
  );
}

export function MarkPaidDialog({
  open,
  onOpenChange,
  defaultAmount,
  currency,
  pending,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
        </DialogHeader>
        <MarkPaidForm
          key={open ? defaultAmount : undefined}
          defaultAmount={defaultAmount}
          currency={currency}
          pending={pending}
          onConfirm={onConfirm}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
