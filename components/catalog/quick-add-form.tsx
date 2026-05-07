"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { parseProductAction } from "@/lib/api/products-ai-actions";
import { createProductAction } from "@/lib/api/products-actions";
import { saveVariantsAction } from "@/lib/api/variants-actions";
import type { ParsedProduct } from "@/lib/api/types";

const MAX_LENGTH = 800;

/**
 * Describe-a-product UX. The AI parses the description into a structured
 * product (and optional variants), then we ship it straight to the backend.
 *
 * On success we navigate to the new product page where the merchant can
 * fine-tune anything Acroma got wrong.
 */
export function QuickAddForm() {
  const router = useRouter();
  const [text, setText] = React.useState("");
  const [parsed, setParsed] = React.useState<ParsedProduct | null>(null);
  const [pending, startTransition] = React.useTransition();
  const [saving, startSave] = React.useTransition();

  function parse() {
    if (!text.trim()) return;
    startTransition(async () => {
      const result = await parseProductAction({
        description: text,
        current: parsed ? (parsed as unknown as Record<string, unknown>) : undefined,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setParsed(result.data);
    });
  }

  function commit() {
    if (!parsed) return;
    startSave(async () => {
      const create = await createProductAction({
        name: parsed.name,
        description: parsed.description ?? undefined,
        basePrice: parsed.basePrice,
        stock: parsed.stock ?? 0,
        category: parsed.category ?? undefined,
        isActive: true,
      });
      if (!create.ok) {
        toast.error(create.error);
        return;
      }

      // If the AI inferred variants, save them in one go.
      if (parsed.hasVariants && parsed.variantDimensions.length > 0) {
        await saveVariantsAction(create.data.id, {
          dimensions: parsed.variantDimensions,
          variants: parsed.variants.map((v) => ({
            attributes: v.attributes,
            stock: v.stock,
            priceOverride: v.priceOverride,
            isActive: true,
          })),
        });
      }

      toast.success("Product added");
      router.replace(`/dashboard/catalog/${create.data.id}`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
        rows={5}
        placeholder='Describe your product in a sentence or two. e.g. "Nike Air Max in black, sizes 8 to 12, GHS 850. White also available, only sizes 9 to 11."'
        className="border-input bg-background hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-ring/40 placeholder:text-muted-foreground min-h-[120px] w-full resize-y rounded-xl border p-3 text-sm leading-relaxed transition-colors focus-visible:ring-2 focus-visible:outline-none"
      />
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={parse}
          disabled={!text.trim() || pending}
          variant="outline"
          className="gap-2 rounded-xl"
        >
          {pending ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {parsed ? "Re-parse with AI" : "Parse with AI"}
        </Button>
      </div>

      {parsed ? <ParsedPreview parsed={parsed} /> : null}

      {parsed ? (
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={commit}
            disabled={saving}
            className="bg-brand-orange hover:bg-brand-orange/90 h-10 gap-2 rounded-xl px-5"
          >
            {saving ? <Loader2 className="animate-spin" /> : <ArrowRight />}
            Add this product
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function ParsedPreview({ parsed }: { parsed: ParsedProduct }) {
  return (
    <div className="border-border/70 bg-card space-y-3 rounded-2xl border p-5">
      <p className="eyebrow text-brand-orange">AI extracted</p>
      <div>
        <p className="text-foreground font-medium">{parsed.name}</p>
        {parsed.category ? (
          <p className="text-muted-foreground text-xs">{parsed.category}</p>
        ) : null}
      </div>
      {parsed.description ? (
        <p className="text-foreground text-sm leading-relaxed">
          {parsed.description}
        </p>
      ) : null}
      <p className="font-display text-foreground text-2xl font-medium tabular-nums">
        {parsed.basePrice}
      </p>
      {parsed.hasVariants && parsed.variantDimensions.length > 0 ? (
        <div className="border-border/70 border-t pt-3">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Variants ({parsed.variants.length})
          </p>
          <ul className="mt-2 space-y-1">
            {parsed.variants.slice(0, 6).map((v, i) => (
              <li
                key={i}
                className="text-foreground flex justify-between text-xs"
              >
                <span>
                  {Object.entries(v.attributes)
                    .map(([k, val]) => `${k}: ${val}`)
                    .join(" · ")}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  ×{v.stock}
                  {v.priceOverride ? ` @ ${v.priceOverride}` : ""}
                </span>
              </li>
            ))}
            {parsed.variants.length > 6 ? (
              <li className="text-muted-foreground text-xs">
                + {parsed.variants.length - 6} more
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
