"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type CopyFieldProps = {
  label: string;
  value: string | null;
  helper?: string;
  monospace?: boolean;
};

/**
 * Read-only, copyable value (webhook URL, verify token, etc.).
 * Falls back to a quiet "—" when the value isn't set yet.
 */
export function CopyField({
  label,
  value,
  helper,
  monospace = true,
}: CopyFieldProps) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-foreground text-sm">{label}</Label>
      <div className="border-border/70 bg-background flex items-center gap-2 rounded-lg border px-3 py-2">
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-sm",
            value ? "text-foreground" : "text-muted-foreground",
            monospace && value && "font-mono text-xs",
          )}
        >
          {value || "—"}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={copied ? "Copied" : "Copy"}
          onClick={copy}
          disabled={!value}
        >
          {copied ? <Check className="text-brand-green" /> : <Copy />}
        </Button>
      </div>
      {helper ? (
        <p className="text-muted-foreground text-xs">{helper}</p>
      ) : null}
    </div>
  );
}
