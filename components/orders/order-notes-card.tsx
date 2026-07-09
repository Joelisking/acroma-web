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
import { updateOrderNotesAction } from "@/lib/api/orders-actions";
import type { Order } from "@/lib/api/types";

type Props = {
  orderId: string;
  notes: Order["notes"];
};

// A merchant-only note on the order. Unlike the delivery address, it can be
// edited on any order regardless of status (you annotate delivered/cancelled
// orders too) and can be cleared. Corrections append auto-notes here.
export function OrderNotesCard({ orderId, notes }: Props) {
  return (
    <section className="card-warm p-5" aria-label="Order note">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
            Note
          </p>
          <p
            className={cn(
              "mt-2 text-sm",
              notes
                ? "text-foreground leading-relaxed break-words whitespace-pre-wrap"
                : "text-muted-foreground",
            )}
          >
            {notes ? notes : "No note yet"}
          </p>
        </div>
        <EditDialog orderId={orderId} currentNotes={notes ?? ""} />
      </div>
    </section>
  );
}

function EditDialog({
  orderId,
  currentNotes,
}: {
  orderId: string;
  currentNotes: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [formKey, setFormKey] = React.useState(0);

  function handleOpenChange(next: boolean) {
    if (next) setFormKey((k) => k + 1);
    setOpen(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
          <Pencil className="size-3.5" />
          {currentNotes ? "Edit" : "Add note"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{currentNotes ? "Edit note" : "Add a note"}</DialogTitle>
          <DialogDescription>
            A private note for you and your staff. The customer never sees it.
          </DialogDescription>
        </DialogHeader>
        <EditForm
          key={formKey}
          orderId={orderId}
          currentNotes={currentNotes}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function EditForm({
  orderId,
  currentNotes,
  onClose,
}: {
  orderId: string;
  currentNotes: string;
  onClose: () => void;
}) {
  const [value, setValue] = React.useState(currentNotes);
  const [pending, startTransition] = React.useTransition();

  // Empty is allowed (clears the note); only block a no-op save.
  const disabled = pending || value.trim() === currentNotes.trim();

  function onSave() {
    startTransition(async () => {
      const result = await updateOrderNotesAction(orderId, value.trim());
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Note saved");
      onClose();
    });
  }

  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="order-note">Note</Label>
        <Textarea
          id="order-note"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. Corrected the price, customer paid the difference in cash"
          rows={4}
          maxLength={2000}
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
