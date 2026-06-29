"use client";

import * as React from "react";
import { ChevronDown, Images } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CatalogImagesManager } from "./catalog-images-manager";
import { CatalogPdfManager } from "./catalog-pdf-manager";

type Props = {
  defaultUrls: string[];
  defaultPdfUrl: string | null;
  /** User-facing noun: "Catalog", "Menu", or "Services" (vertical-aware). */
  noun: string;
};

/**
 * Collapsible wrapper around the catalog PDF + images managers. Starts open
 * when the merchant has nothing set yet (so they're prompted to add something)
 * and collapsed once a PDF or photos exist, keeping the catalog page tidy.
 */
export function CatalogImagesSection({
  defaultUrls,
  defaultPdfUrl,
  noun,
}: Props) {
  const count = defaultUrls.length;
  const hasAny = count > 0 || !!defaultPdfUrl;
  const [open, setOpen] = React.useState(!hasAny);

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
            <p className="text-foreground text-sm font-medium">
              {noun} on WhatsApp
            </p>
            <p className="text-muted-foreground text-sm">
              {hasAny
                ? `${defaultPdfUrl ? "PDF set" : `${count} ${count === 1 ? "photo" : "photos"}`}. Tap to manage.`
                : `Upload a ${noun.toLowerCase()} PDF or photos.`}
            </p>
          </div>
        </div>
        <ChevronDown
          className="text-muted-foreground size-5 shrink-0 transition-transform group-data-[state=open]:rotate-180"
          aria-hidden
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-5 px-5 pb-5">
        <p className="text-muted-foreground text-sm">
          When customers ask what you have, Acroma sends this on WhatsApp. A PDF
          is sent as one tidy document; otherwise the photos go in the order you
          set.
        </p>
        <CatalogPdfManager defaultUrl={defaultPdfUrl} noun={noun} />
        <div className="border-border/60 border-t pt-5">
          <CatalogImagesManager defaultUrls={defaultUrls} noun={noun} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
