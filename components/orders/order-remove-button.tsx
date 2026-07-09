"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  archiveOrderAction,
  unarchiveOrderAction,
} from "@/lib/api/orders-actions";

type Props = {
  orderId: string;
  /** Whether this order is currently removed (archived). */
  archived: boolean;
};

/**
 * Remove an order from the dashboard, or restore a removed one. Removing is a
 * recoverable soft-delete: it cancels the order (restoring any held stock) and
 * hides it from the default list, but keeps it under the Removed filter. Guarded
 * by an AlertDialog because it changes order state.
 */
export function OrderRemoveButton({ orderId, archived }: Props) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function restore() {
    startTransition(async () => {
      const result = await unarchiveOrderAction(orderId);
      if (!result.ok) toast.error(result.error);
      else {
        toast.success("Order restored");
        router.refresh();
      }
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await archiveOrderAction(orderId);
      if (!result.ok) toast.error(result.error);
      else {
        toast.success("Order removed");
        router.push("/dashboard/orders");
      }
    });
  }

  if (archived) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={restore}
        className="gap-1.5"
      >
        <RotateCcw className="size-3.5" />
        Restore to orders
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending}
          className="text-destructive hover:text-destructive gap-1.5"
        >
          <Trash2 className="size-3.5" />
          Remove order
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove this order?</AlertDialogTitle>
          <AlertDialogDescription>
            It leaves your orders list and stops counting toward your totals. If
            it was still active we cancel it and restore any stock. You can bring
            it back anytime from the Removed filter.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Keep order</AlertDialogCancel>
          <AlertDialogAction disabled={pending} onClick={remove}>
            Remove order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
