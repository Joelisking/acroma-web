"use client";

import * as React from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { markConversationResolvedAction } from "@/lib/api/conversations-actions";

type MarkResolvedButtonProps = {
  conversationId: string;
};

/**
 * Renders alongside the pending-owner banner. Opens a small confirm dialog
 * before firing `markConversationResolvedAction`, since this is the "I've
 * handled this offline, stop bothering me" path — destructive of reminder
 * state, but recoverable (merchant can still reply later).
 */
export function MarkResolvedButton({ conversationId }: MarkResolvedButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  function run() {
    startTransition(async () => {
      const result = await markConversationResolvedAction(conversationId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Marked as resolved, reminders stopped");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-brand-orange/30 text-brand-orange hover:bg-brand-orange/10 hover:text-brand-orange shrink-0 gap-1.5 bg-transparent"
        >
          <CheckCircle2 className="size-4" />
          Mark resolved
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Stop reminders for this conversation?</DialogTitle>
          <DialogDescription>
            Use this if you&apos;ve already handled it offline (a call, a
            message in another app, in person). The reminders will stop and
            Acroma will go back to its normal AI handling.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={pending}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={run} disabled={pending} className="gap-2">
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Stop reminders
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
