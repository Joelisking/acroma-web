"use client";

import * as React from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirmedAction } from "@/components/impersonation/use-confirmed-action";
import { deleteProductAction } from "@/lib/api/products-actions";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName?: string;
}) {
  const [pending, startTransition] = React.useTransition();
  const [confirming, setConfirming] = React.useState(false);
  const confirm = useConfirmedAction();

  React.useEffect(() => {
    if (!confirming) return;
    const t = window.setTimeout(() => setConfirming(false), 4000);
    return () => window.clearTimeout(t);
  }, [confirming]);

  function onClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(() => {
      void confirm(
        {
          title: productName
            ? `Permanently delete item "${productName}"`
            : "Permanently delete this item",
          description: "The item and its variants are removed from the catalog.",
          risk: "high",
          confirmLabel: "Yes, delete item",
        },
        async () => {
          await deleteProductAction(productId);
          return true;
        },
      );
    });
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={onClick}
      disabled={pending}
      className="gap-1.5"
    >
      {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
      {confirming ? "Click again to confirm" : "Delete"}
    </Button>
  );
}
