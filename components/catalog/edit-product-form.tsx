"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProductAction } from "@/lib/api/products-actions";
import { autofillProductAction } from "@/lib/api/products-ai-actions";
import { ImageUploader } from "@/components/shared/image-uploader";
import { ProductTagsPicker } from "@/components/catalog/product-tags-picker";
import { CategoryCombobox } from "@/components/catalog/category-combobox";
import { useVocab } from "@/components/vocabulary-provider";
import type { BusinessType, ProductTag } from "@/lib/api/types";

const PRODUCT_TAG_VALUES = [
  "HALAL",
  "VEGETARIAN",
  "VEGAN",
  "GLUTEN_FREE",
  "DAIRY_FREE",
  "CONTAINS_NUTS",
  "SPICY",
] as const;

const schema = z.object({
  name: z.string().min(2, "Name is required").max(120),
  description: z.string().max(2000).optional().or(z.literal("")),
  basePrice: z.number().min(0, "Must be 0 or more"),
  stock: z.number().int().min(0).optional(),
  estimatedDurationMinutes: z.number().int().min(0).optional(),
  category: z.string().max(40).optional().or(z.literal("")),
  imageUrl: z.string().url().or(z.literal("")).optional(),
  isActive: z.boolean(),
  tags: z.array(z.enum(PRODUCT_TAG_VALUES)).optional(),
});

type FormValues = z.infer<typeof schema>;

function toNumber(v: string): number {
  if (v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

type Props = {
  productId: string;
  defaults: Partial<FormValues>;
  /** Drives whether the tag picker starts expanded (food merchants do). */
  businessType?: BusinessType | null;
  /** Existing categories to offer in the category combobox. */
  categories?: string[];
};

export function EditProductForm({
  productId,
  defaults,
  businessType,
  categories = [],
}: Props) {
  const router = useRouter();
  const vocab = useVocab();
  const isFood = businessType === "FOOD_BEVERAGES";
  const isServices = businessType === "SERVICES";
  const tracksStock = vocab.tracksStock;
  const [pending, startTransition] = React.useTransition();
  const [autofilling, startAutofill] = React.useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaults.name ?? "",
      description: defaults.description ?? "",
      basePrice: defaults.basePrice ?? 0,
      stock: defaults.stock ?? 0,
      estimatedDurationMinutes: defaults.estimatedDurationMinutes ?? undefined,
      category: defaults.category ?? "",
      imageUrl: defaults.imageUrl ?? "",
      isActive: defaults.isActive ?? true,
      tags: defaults.tags ?? [],
    },
  });

  function autofillFromName() {
    const name = form.getValues("name").trim();
    if (!name) {
      toast.info(`Type a ${vocab.itemLower} name first`);
      return;
    }
    startAutofill(async () => {
      const result = await autofillProductAction(name);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const { category, description } = result.data;
      if (category && !form.getValues("category"))
        form.setValue("category", category, { shouldDirty: true });
      if (description && !form.getValues("description"))
        form.setValue("description", description, { shouldDirty: true });
      toast.success("Filled in suggestions");
    });
  }

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await updateProductAction(productId, {
        name: values.name,
        description: values.description || undefined,
        basePrice: values.basePrice,
        stock: values.stock ?? 0,
        estimatedDurationMinutes: values.estimatedDurationMinutes,
        category: values.category || undefined,
        imageUrl: values.imageUrl || undefined,
        isActive: values.isActive,
        // Always send the tags array (even when empty) so the backend
        // applies the merchant's exact selection via Prisma `set:`. The
        // server-side handler treats an explicit empty array as "clear",
        // which is what the merchant means by deselecting all chips.
        tags: values.tags ?? [],
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`${vocab.item} updated`);
      router.replace(`/dashboard/catalog/${result.data.id}`);
      router.refresh();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Name</FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={autofillFromName}
                  disabled={autofilling}
                  className="text-brand-orange hover:text-brand-orange gap-1"
                >
                  {autofilling ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <LogoMark tone="current" className="size-4" />
                  )}
                  Auto-fill
                </Button>
              </div>
              <FormControl>
                <Input className="h-11" autoFocus {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  rows={3}
                  className="border-input bg-background hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-ring/40 placeholder:text-muted-foreground min-h-[80px] w-full resize-y rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className={isFood ? "grid gap-5 sm:grid-cols-2" : "grid gap-5 sm:grid-cols-3"}>
          <FormField
            control={form.control}
            name="basePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    className="h-11 tabular-nums"
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={field.value ?? 0}
                    onChange={(e) => field.onChange(toNumber(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {tracksStock ? (
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      className="h-11 tabular-nums"
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={field.value ?? 0}
                      onChange={(e) => field.onChange(toNumber(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <CategoryCombobox
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    categories={categories}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isServices ? (
            <FormField
              control={form.control}
              name="estimatedDurationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="e.g. 45"
                      className="h-11 tabular-nums"
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : toNumber(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
        </div>

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <ImageUploader
                  value={field.value || null}
                  onChange={(url) => field.onChange(url ?? "")}
                  kind="product"
                  aspect="aspect-[4/3]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isFood ? (
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ProductTagsPicker
                    value={(field.value ?? []) as ProductTag[]}
                    onChange={(tags) => field.onChange(tags)}
                    expandedByDefault={isFood}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="border-border/70 bg-muted/30 flex items-center justify-between rounded-xl border p-4">
              <div>
                <FormLabel>Visible to customers</FormLabel>
                <FormDescription>
                  Hidden products won&apos;t appear in AI replies or menus.
                </FormDescription>
              </div>
              <FormControl>
                <input
                  type="checkbox"
                  className="size-5 accent-[var(--brand-orange)]"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={pending}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={pending}
            className="bg-brand-orange hover:bg-brand-orange/90 h-10 gap-2 rounded-xl px-5"
          >
            {pending ? <Loader2 className="animate-spin" /> : null}
            Save changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
