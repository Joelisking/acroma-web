"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  setBusinessTypeAction,
  type BusinessType,
} from "@/lib/api/onboarding-actions";
import { cn } from "@/lib/utils";

const TYPES: { value: BusinessType; label: string; emoji: string }[] = [
  { value: "ELECTRONICS", label: "Electronics", emoji: "📱" },
  { value: "FASHION_CLOTHING", label: "Fashion", emoji: "👗" },
  { value: "FOOD_BEVERAGES", label: "Food & drinks", emoji: "🍔" },
  { value: "BEAUTY_COSMETICS", label: "Beauty", emoji: "💄" },
  { value: "HOME_FURNITURE", label: "Home", emoji: "🛋️" },
  { value: "SERVICES", label: "Services", emoji: "🛠️" },
  { value: "GENERAL_STORE", label: "General store", emoji: "🏪" },
  { value: "OTHER", label: "Other", emoji: "✏️" },
];

export function BusinessTypeForm() {
  const router = useRouter();
  const [selected, setSelected] = React.useState<BusinessType | null>(null);
  const [description, setDescription] = React.useState("");
  const [pending, startTransition] = React.useTransition();

  const needsDescription = selected === "OTHER";
  const canSubmit =
    !!selected && (!needsDescription || description.trim().length > 0);

  function onContinue() {
    if (!canSubmit) return;
    startTransition(async () => {
      const result = await setBusinessTypeAction({
        businessType: selected!,
        businessDescription: description.trim() || undefined,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      router.push("/onboarding/step-2");
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TYPES.map((t) => {
          const active = selected === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setSelected(t.value)}
              className={cn(
                "border-border/70 bg-card hover:border-brand-orange/40 flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all",
                "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                active &&
                  "border-brand-orange bg-brand-orange-soft ring-brand-orange/15 ring-4",
              )}
            >
              <span className="text-2xl">{t.emoji}</span>
              <span
                className={cn(
                  "text-xs font-medium",
                  active ? "text-brand-navy" : "text-foreground",
                )}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {needsDescription ? (
        <textarea
          autoFocus
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 300))}
          placeholder="Tell us in a sentence what your business sells…"
          className="border-input bg-background hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-ring/40 placeholder:text-muted-foreground w-full resize-none rounded-xl border p-3 text-sm leading-relaxed transition-colors focus-visible:ring-2 focus-visible:outline-none"
        />
      ) : null}

      <div className="flex justify-end">
        <Button
          onClick={onContinue}
          disabled={!canSubmit || pending}
          className="bg-brand-orange hover:bg-brand-orange/90 h-11 gap-2 rounded-xl px-6 text-sm"
        >
          {pending ? <Loader2 className="animate-spin" /> : null}
          Continue
        </Button>
      </div>
    </div>
  );
}
