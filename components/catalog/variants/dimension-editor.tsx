"use client";

import { Plus, X } from "lucide-react";
import type { VariantDimension } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DimensionEditorProps = {
  dimensions: VariantDimension[];
  onChange: (dimensions: VariantDimension[]) => void;
};

const MAX_DIMENSIONS = 3;
const MAX_OPTIONS = 6;

/**
 * UI for managing dimension list + their options.
 * Backend caps at 3 dimensions × 6 options each.
 */
export function DimensionEditor({
  dimensions,
  onChange,
}: DimensionEditorProps) {
  function setName(idx: number, name: string) {
    onChange(dimensions.map((d, i) => (i === idx ? { ...d, name } : d)));
  }

  function setOptions(idx: number, options: string[]) {
    onChange(dimensions.map((d, i) => (i === idx ? { ...d, options } : d)));
  }

  function removeDimension(idx: number) {
    onChange(dimensions.filter((_, i) => i !== idx));
  }

  function addDimension() {
    if (dimensions.length >= MAX_DIMENSIONS) return;
    onChange([...dimensions, { name: "", options: [] }]);
  }

  return (
    <div className="space-y-4">
      {dimensions.map((dim, idx) => (
        <div
          key={idx}
          className="border-border/70 bg-card space-y-3 rounded-2xl border p-4"
        >
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs">Dimension</Label>
              <Input
                value={dim.name}
                onChange={(e) => setName(idx, e.target.value)}
                placeholder="e.g. Color, Size"
                className="h-10"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Remove dimension"
              onClick={() => removeDimension(idx)}
            >
              <X />
            </Button>
          </div>

          <OptionsEditor
            options={dim.options}
            onChange={(opts) => setOptions(idx, opts)}
          />
        </div>
      ))}

      {dimensions.length < MAX_DIMENSIONS ? (
        <Button
          type="button"
          variant="outline"
          onClick={addDimension}
          className="w-full gap-2 rounded-xl"
        >
          <Plus />
          Add dimension
        </Button>
      ) : null}
    </div>
  );
}

function OptionsEditor({
  options,
  onChange,
}: {
  options: string[];
  onChange: (opts: string[]) => void;
}) {
  function add(value: string) {
    const v = value.trim();
    if (!v) return;
    if (options.includes(v)) return;
    if (options.length >= MAX_OPTIONS) return;
    onChange([...options, v]);
  }

  function remove(idx: number) {
    onChange(options.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs">Options</Label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt, i) => (
          <span
            key={`${opt}-${i}`}
            className="bg-brand-orange-soft text-brand-orange inline-flex items-center gap-1 rounded-full py-1 pr-1 pl-3 text-xs font-medium"
          >
            {opt}
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Remove ${opt}`}
              className="hover:bg-brand-orange/15 inline-flex size-4 items-center justify-center rounded-full"
            >
              <X className="size-3" strokeWidth={2.5} />
            </button>
          </span>
        ))}
      </div>

      <Input
        placeholder={
          options.length >= MAX_OPTIONS
            ? "Max 6 options"
            : "Type an option, press Enter"
        }
        disabled={options.length >= MAX_OPTIONS}
        className="h-10"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const target = e.target as HTMLInputElement;
            add(target.value);
            target.value = "";
          }
        }}
      />
    </div>
  );
}
