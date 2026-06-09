"use client";

import * as React from "react";
import { ChevronDown, Images } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CatalogImagesManager } from "./catalog-images-manager";

type Props = {
  defaultUrls: string[];
  /** User-facing noun: "Catalog", "Menu", or "Services" (vertical-aware). */
  noun: string;
};

/**
 * Collapsible wrapper around the catalog images manager. Starts open when the
 * merchant has no images yet (so they're prompted to add some) and collapsed
 * once photos exist, keeping the catalog page tidy.
 */
export function CatalogImagesSection({ defaultUrls, noun }: Props) {
  const count = defaultUrls.length;
  const [open, setOpen] = React.useState(count === 0);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="border-border/70 bg-card rounded-2xl border"
    >
      <CollapsibleTrigger className="hover:bg-accent/40 group flex w-full items-center justify-between gap-4 rounded-2xl p-5 text-left transition-colors">
        <div className="flex items-center gap-3">
          <span className="bg-brand-blue-soft text-brand-blue flex size-10 shrink-0 items-center justify-center rounded-xl">
            <Images className="size-5" />
          </span>
          <div>
            <p className="text-foreground text-sm font-medium">{noun} images</p>
            <p className="text-muted-foreground text-sm">
              {count === 0
                ? `Upload up to 8 photos of your ${noun.toLowerCase()}.`
                : `${count} ${count === 1 ? "photo" : "photos"} added. Tap to manage.`}
            </p>
          </div>
        </div>
        <ChevronDown
          className="text-muted-foreground size-5 shrink-0 transition-transform group-data-[state=open]:rotate-180"
          aria-hidden
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 px-5 pb-5">
        <p className="text-muted-foreground text-sm">
          When customers ask what you have, Acroma sends them on WhatsApp, in
          the order you set.
        </p>
        <CatalogImagesManager defaultUrls={defaultUrls} noun={noun} />
      </CollapsibleContent>
    </Collapsible>
  );
}
