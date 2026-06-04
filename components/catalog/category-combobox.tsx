"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

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

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** Existing categories to choose from. */
  categories: string[];
  id?: string;
  placeholder?: string;
};

/**
 * Creatable category picker: choose an existing category or add a new one
 * inline by typing it and picking "Add ...". Categories are free-text on
 * products, so "adding" just sets the field value; it is persisted when the
 * item is saved.
 */
export function CategoryCombobox({
  value,
  onChange,
  categories,
  id,
  placeholder = "Select or add a category",
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();
  const exists = categories.some((c) => c.toLowerCase() === lower);
  const filtered = trimmed
    ? categories.filter((c) => c.toLowerCase().includes(lower))
    : categories;

  function commit(next: string) {
    onChange(next);
    setQuery("");
    setOpen(false);
  }

  const showEmptyHint =
    filtered.length === 0 && !value && !(trimmed && !exists);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-11 w-full justify-between font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search or add..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {value ? (
              <CommandItem
                value="__clear"
                onSelect={() => commit("")}
                className="text-muted-foreground"
              >
                No category
              </CommandItem>
            ) : null}

            {filtered.map((category) => (
              <CommandItem
                key={category}
                value={category}
                onSelect={() => commit(category)}
              >
                <Check
                  className={cn(
                    "size-4",
                    value === category ? "opacity-100" : "opacity-0",
                  )}
                />
                {category}
              </CommandItem>
            ))}

            {trimmed && !exists ? (
              <CommandItem value="__add" onSelect={() => commit(trimmed)}>
                <Plus className="size-4" />
                Add &quot;{trimmed}&quot;
              </CommandItem>
            ) : null}

            {showEmptyHint ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                No categories yet. Type to add one.
              </p>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
