"use client";

import * as React from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProductAction } from "@/lib/api/products-actions";

export function DeleteProductButton({ productId }: { productId: string }) {
  const [pending, startTransition] = React.useTransition();
  const [confirming, setConfirming] = React.useState(false);

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
      void deleteProductAction(productId);
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
