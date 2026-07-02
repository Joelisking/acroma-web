"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Product } from "@/lib/api/types";

type Props = {
  products: Product[];
  value: string | null;
  onChange: (product: Product) => void;
  placeholder?: string;
};

/**
 * Search-and-pick combobox for a single catalog product on an order line.
 * Variant selection (when the picked product has variants) is a separate
 * control rendered by the caller — this component only resolves the product.
 */
export function ProductLinePicker({
  products,
  value,
  onChange,
  placeholder = "Search products...",
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const selected = products.find((p) => p.id === value) ?? null;
  const lower = query.trim().toLowerCase();
  const filtered = lower
    ? products.filter((p) => p.name.toLowerCase().includes(lower))
    : products;

  function commit(product: Product) {
    onChange(product);
    setQuery("");
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-11 w-full justify-between font-normal",
            !selected && "text-muted-foreground",
          )}
        >
          <span className="truncate">{selected?.name ?? placeholder}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search products..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {filtered.map((product) => (
              <CommandItem
                key={product.id}
                value={product.id}
                onSelect={() => commit(product)}
              >
                <Check
                  className={cn(
                    "size-4",
                    value === product.id ? "opacity-100" : "opacity-0",
                  )}
                />
                {product.name}
              </CommandItem>
            ))}
            {filtered.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                No matching products.
              </p>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
