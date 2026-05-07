"use client";

import * as React from "react";
import { Sparkles, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NewProductMode } from "@/hooks/use-new-product";

type Props = {
  mode: NewProductMode;
  onModeChange: (next: NewProductMode) => void;
};

export function NewProductTabs({ mode, onModeChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Add product method"
      className="border-border/70 bg-card flex gap-1 rounded-full border p-1"
    >
      <TabButton
        active={mode === "describe"}
        onClick={() => onModeChange("describe")}
        icon={Sparkles}
        label="Describe with AI"
      />
      <TabButton
        active={mode === "manual"}
        onClick={() => onModeChange("manual")}
        icon={Pencil}
        label="Manual"
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors sm:text-sm",
        active
          ? "bg-brand-orange text-primary-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}
