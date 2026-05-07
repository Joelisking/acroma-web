"use client";

import * as React from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { suggestVariantsAction } from "@/lib/api/variants-actions";
import type { VariantDimension } from "@/lib/api/types";

type SuggestButtonProps = {
  productId: string;
  productName: string;
  onSuggestions: (dimensions: VariantDimension[]) => void;
};

export function SuggestButton({
  productId,
  productName,
  onSuggestions,
}: SuggestButtonProps) {
  const [pending, startTransition] = React.useTransition();

  function run() {
    startTransition(async () => {
      const result = await suggestVariantsAction(productId, productName);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (result.data.suggestions.length === 0) {
        toast.info("No obvious variant dimensions for this product");
        return;
      }
      onSuggestions(result.data.suggestions);
      toast.success("Filled in suggested dimensions");
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={run}
      disabled={pending}
      className="gap-2"
    >
      {pending ? <Loader2 className="animate-spin" /> : <Sparkles />}
      Suggest with AI
    </Button>
  );
}
