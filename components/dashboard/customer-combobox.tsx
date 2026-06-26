"use client";

import { useState, useTransition } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { searchCustomersAction } from "@/lib/api/dashboard-actions";
import { cn } from "@/lib/utils";

type CustomerOption = { phone: string; name: string | null };

type Props = {
  value?: string;
  onChange: (phone: string | undefined) => void;
  className?: string;
};

export function CustomerCombobox({ value, onChange, className }: Props) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<CustomerOption[]>([]);
  const [isPending, startTransition] = useTransition();

  function runSearch(search: string) {
    startTransition(async () => {
      const res = await searchCustomersAction(search);
      if (res.ok) setOptions(res.data);
    });
  }

  const selected = options.find((o) => o.phone === value);
  const triggerLabel = value
    ? (selected?.name ?? value)
    : "Any customer";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next && options.length === 0) runSearch("");
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            role="combobox"
            aria-expanded={open}
            className="flex-1 justify-between gap-2"
          >
            <span className="truncate">{triggerLabel}</span>
            <ChevronsUpDown className="size-3.5 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search customers…"
              onValueChange={runSearch}
            />
            <CommandList>
              <CommandEmpty>
                {isPending ? "Searching…" : "No customers found."}
              </CommandEmpty>
              <CommandGroup>
                {options.map((c) => (
                  <CommandItem
                    key={c.phone}
                    value={c.phone}
                    onSelect={() => {
                      onChange(c.phone === value ? undefined : c.phone);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        c.phone === value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="truncate">{c.name ?? c.phone}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value ? (
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="Clear customer filter"
          onClick={() => onChange(undefined)}
        >
          <X className="size-3.5" />
        </Button>
      ) : null}
    </div>
  );
}
