"use client";

import * as React from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { updateDeliveryAddressAction } from "@/lib/api/orders-actions";
import type { Order, OrderStatus } from "@/lib/api/types";

const EDITABLE_STATUSES: OrderStatus[] = [
  "PENDING",
  "PAYMENT_PENDING",
  "PAID",
  "PROCESSING",
  "PREPARING",
];

type Props = {
  orderId: string;
  status: OrderStatus;
  deliveryAddress: Order["deliveryAddress"];
};

export function DeliveryAddressCard({
  orderId,
  status,
  deliveryAddress,
}: Props) {
  const editable = EDITABLE_STATUSES.includes(status);

  return (
    <section
      className="border-border/70 bg-card rounded-2xl border p-5"
      aria-label="Delivery address"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow text-muted-foreground">Delivery address</p>
          <p
            className={cn(
              "mt-2 text-sm",
              deliveryAddress
                ? "text-foreground leading-relaxed whitespace-pre-wrap break-words"
                : "text-muted-foreground",
            )}
          >
            {deliveryAddress ?? "—"}
          </p>
        </div>
        {editable ? (
          <EditDialog
            orderId={orderId}
            currentAddress={deliveryAddress ?? ""}
          />
        ) : null}
      </div>
    </section>
  );
}

function EditDialog({
  orderId,
  currentAddress,
}: {
  orderId: string;
  currentAddress: string;
}) {
  const [open, setOpen] = React.useState(false);
  // Increment to remount EditForm with fresh state each time the dialog opens.
  const [formKey, setFormKey] = React.useState(0);

  function handleOpenChange(next: boolean) {
    if (next) setFormKey((k) => k + 1);
    setOpen(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
          <Pencil className="size-3.5" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit delivery address</DialogTitle>
          <DialogDescription>
            Confirm the new address with the customer before saving — Acroma
            won&apos;t message them about this change.
          </DialogDescription>
        </DialogHeader>
        <EditForm
          key={formKey}
          orderId={orderId}
          currentAddress={currentAddress}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function EditForm({
  orderId,
  currentAddress,
  onClose,
}: {
  orderId: string;
  currentAddress: string;
  onClose: () => void;
}) {
  const [value, setValue] = React.useState(currentAddress);
  const [pending, startTransition] = React.useTransition();

  const trimmed = value.trim();
  const disabled =
    pending || trimmed.length === 0 || value === currentAddress;

  function onSave() {
    startTransition(async () => {
      const result = await updateDeliveryAddressAction(orderId, trimmed);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Delivery address updated");
      onClose();
    });
  }

  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="delivery-address">Address</Label>
        <Textarea
          id="delivery-address"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Landmark, area, or anything that helps us find them"
          rows={4}
          maxLength={500}
          disabled={pending}
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={disabled}>
          Save
        </Button>
      </DialogFooter>
    </>
  );
}
