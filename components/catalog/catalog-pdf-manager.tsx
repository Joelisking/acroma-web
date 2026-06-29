"use client";

import * as React from "react";
import { toast } from "sonner";
import { ExternalLink, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  uploadPdf,
  ImageUploadError,
  PDF_ACCEPT,
} from "@/lib/cloudinary-upload";
import { updateCatalogPdfAction } from "@/lib/api/settings-actions";

type Props = {
  defaultUrl: string | null;
  /** User-facing noun: "Catalog" or "Menu" (vertical-aware). */
  noun: string;
};

/**
 * Single-PDF picker for the catalog/menu. Selecting a PDF uploads it and saves
 * immediately; removing clears it. When a PDF is set, Acroma sends it instead
 * of the catalog images when customers ask what you have.
 */
export function CatalogPdfManager({ defaultUrl, noun }: Props) {
  const [url, setUrl] = React.useState<string | null>(defaultUrl);
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const uploaded = await uploadPdf(file);
      const result = await updateCatalogPdfAction(uploaded);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setUrl(result.data.catalogPdfUrl);
      toast.success(`${noun} PDF saved`);
    } catch (err) {
      toast.error(
        err instanceof ImageUploadError
          ? err.message
          : "Upload failed. Please try again",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    setBusy(true);
    try {
      const result = await updateCatalogPdfAction(null);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setUrl(result.data.catalogPdfUrl);
      toast.success(`${noun} PDF removed`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-foreground text-sm font-medium">{noun} PDF</p>
        <p className="text-muted-foreground text-sm">
          If a PDF is set, Acroma sends it instead of the images when customers
          ask what you have.
        </p>
      </div>

      {url ? (
        <div className="border-border/70 bg-muted/40 flex items-center gap-3 rounded-xl border p-3">
          <span className="bg-brand-orange-soft text-brand-orange flex size-10 shrink-0 items-center justify-center rounded-xl">
            <FileText className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-sm font-medium">
              {noun} PDF
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-blue inline-flex items-center gap-1 text-xs hover:underline"
            >
              View PDF <ExternalLink className="size-3" />
            </a>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={busy}
            className="text-muted-foreground hover:text-destructive gap-1.5"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Remove
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="gap-1.5"
        >
          {busy ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Upload />
          )}
          {busy ? "Uploading..." : "Upload PDF"}
        </Button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={PDF_ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
