"use client";

import * as React from "react";
import { Pencil } from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";
import { cn } from "@/lib/utils";
import type { NewProductMode } from "@/hooks/use-new-product";

/** The Acroma mark, inheriting the tab's text colour. */
function AiMark({ className }: { className?: string }) {
  return <LogoMark tone="current" className={className} />;
}

type Props = {
  mode: NewProductMode;
  onModeChange: (next: NewProductMode) => void;
};

export function NewProductTabs({ mode, onModeChange }: Props) {
  return (
    <div role="tablist" aria-label="Add item method" className="seg w-full">
      <TabButton
        active={mode === "manual"}
        onClick={() => onModeChange("manual")}
        icon={Pencil}
        label="Enter manually"
      />
      <TabButton
        active={mode === "describe"}
        onClick={() => onModeChange("describe")}
        icon={AiMark}
        label="Describe with AI"
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
        "flex flex-1 items-center justify-center gap-2",
        active && "on",
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}
