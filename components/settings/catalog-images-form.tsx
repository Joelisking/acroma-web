"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/shared/image-uploader";
import { updateCatalogImagesAction } from "@/lib/api/settings-actions";

type Props = {
  defaultUrls: string[];
};

export function CatalogImagesForm({ defaultUrls }: Props) {
  const [slots, setSlots] = React.useState<Array<string | null>>([
    defaultUrls[0] ?? null,
    defaultUrls[1] ?? null,
    defaultUrls[2] ?? null,
  ]);
  const [pending, startTransition] = React.useTransition();

  function handleChange(index: number, value: string | null) {
    setSlots((prev) => {
      const next = [...prev] as Array<string | null>;
      next[index] = value;
      return next;
    });
  }

  function handleSave() {
    const urls = slots.filter((u): u is string => u !== null);
    startTransition(async () => {
      const result = await updateCatalogImagesAction(urls);
      if (!result.ok) toast.error(result.error);
      else toast.success("Catalog images saved");
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {slots.map((url, i) => (
          <ImageUploader
            key={`catalog-slot-${i}`}
            value={url}
            onChange={(v) => handleChange(i, v)}
            kind="catalog"
            aspect="aspect-[3/4]"
          />
        ))}
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={pending}>
          {pending ? "Saving..." : "Save images"}
        </Button>
      </div>
    </div>
  );
}
