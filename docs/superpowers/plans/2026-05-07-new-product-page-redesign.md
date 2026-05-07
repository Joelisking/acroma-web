# New Product Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two-tab "AI vs Manual" new-product page with a shared-state design where AI parsing fills a controlled form, post-parse refinements happen via a chat-style follow-up, the Manual tab edits the same data, and image upload (product + per-variant-option) is hoisted to the page level so both modes can use it.

**Architecture:** State (`mode`, `formValues`, `parsedPreview`, `originalDescription`) lives on the page client component. A custom hook (`useNewProduct`) owns the parse / refine / commit handlers. Both panels are dumb children that read `formValues` and call `setFormValues`. Image surfaces live on the page, outside both panels. The mobile `VariantOptionImages` component is ported to web using the existing `ImageUploader`. Edit-product flow is split into its own component (`EditProductForm`) and is otherwise untouched.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, shadcn/ui, react-hook-form (edit form only — create flow is plain controlled state), `sonner` toasts, server actions in `lib/api/*-actions.ts`.

**Spec:** `docs/superpowers/specs/2026-05-07-new-product-page-redesign-design.md`

**Verification gate (per `acroma-web/CLAUDE.md`):** every task that touches code must end with `npm run lint` and `npm run build` green. The final task adds in-browser verification.

---

## File map

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/api/types.ts` | modify | Add `ProductFormValues` type. |
| `components/catalog/variant-option-images.tsx` | create | Port of mobile component; per-dimension photo pickers, two-step UX. |
| `components/catalog/edit-product-form.tsx` | create | Trimmed copy of current `product-form.tsx`, edit-mode only. Keeps `react-hook-form` + autofill button. |
| `app/dashboard/catalog/[id]/edit/page.tsx` | modify | Update import to `EditProductForm`. |
| `components/catalog/manual-product-form.tsx` | create | Controlled create-mode form: `values` + `onChange` props, no submit button, no image field. |
| `components/catalog/describe-with-ai-panel.tsx` | create | Two-stage Quick Add UX (pre-parse textarea + post-parse refine textarea). |
| `components/catalog/new-product-tabs.tsx` | rewrite | Dumb segmented control: `mode` + `setMode` props. |
| `hooks/use-new-product.ts` | create | Owns parse / refine / commit handlers. Returns state + actions. |
| `app/dashboard/catalog/new/page.tsx` | rewrite | Client component. Renders header + tabs + active panel + image sections + save bar. |
| `components/catalog/quick-add-form.tsx` | delete | Replaced by `describe-with-ai-panel.tsx`. |
| `components/catalog/product-form.tsx` | delete | Replaced by `manual-product-form.tsx` (create) and `edit-product-form.tsx` (edit). |

---

## Task 1: Add `ProductFormValues` to types

**Files:**
- Modify: `lib/api/types.ts` (append after `Product` type, before the `Orders` section banner near line 155)

- [ ] **Step 1: Add the type**

Insert this block in `lib/api/types.ts` immediately AFTER the `Product` type (the closing `};` of `Product`) and BEFORE the `// ----- Orders` banner:

```ts
// ---------------------------------------------------------------------------
// Form state shapes (UI-side, not from the API)
// ---------------------------------------------------------------------------

export type ProductVariantFormRow = {
  attributes: Record<string, string>;
  stock: number;
  priceOverride: number | null;
  isActive: boolean;
};

/**
 * Editable shape backing the new-product page. Numeric fields are kept
 * as strings so that controlled inputs never fight the user mid-typing
 * (mirrors the mobile app's `ProductFormValues`). Conversion to numbers
 * happens at submit time.
 */
export type ProductFormValues = {
  name: string;
  description: string;
  basePrice: string;
  stock: string;
  category: string;
  imageUrl: string;
  isActive: boolean;
  hasVariants: boolean;
  variantDimensions: VariantDimension[];
  variants: ProductVariantFormRow[];
};
```

- [ ] **Step 2: Verify it compiles**

Run: `cd acroma-web && npm run typecheck`
Expected: PASS (no new errors). The type is unused at this point but must parse.

- [ ] **Step 3: Commit**

```bash
cd acroma-web
git add lib/api/types.ts
git commit -m "feat(catalog): add ProductFormValues type for new-product page"
```

---

## Task 2: Port `VariantOptionImages` from mobile

**Files:**
- Create: `components/catalog/variant-option-images.tsx`

- [ ] **Step 1: Create the file**

Create `components/catalog/variant-option-images.tsx` with this content:

```tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/shared/image-uploader";
import { cn } from "@/lib/utils";
import type { VariantDimension } from "@/lib/api/types";

type Props = {
  dimensions: VariantDimension[];
  onChange: (dims: VariantDimension[]) => void;
};

/**
 * Two-step UX for attaching photos to variant options.
 *
 *   1. Ask which dimensions need their own photo (e.g. Color but not Size).
 *   2. Show a row of `ImageUploader`s per option for each selected dimension.
 *
 * Ported from the mobile `VariantOptionImages` component to keep cross-platform
 * parity. Writes into `dimension.optionImages[option]` for each picker.
 */
export function VariantOptionImages({ dimensions, onChange }: Props) {
  const [selected, setSelected] = React.useState<string[]>(() =>
    dimensions
      .filter((d) => d.optionImages && Object.keys(d.optionImages).length > 0)
      .map((d) => d.name),
  );
  const [decided, setDecided] = React.useState(() =>
    dimensions.some(
      (d) => d.optionImages && Object.keys(d.optionImages).length > 0,
    ),
  );

  function toggleDim(name: string) {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  }

  function confirm() {
    const updated = dimensions.map((dim) => {
      if (selected.includes(dim.name)) return dim;
      const { optionImages: _removed, ...rest } = dim;
      return rest;
    });
    onChange(updated);
    setDecided(true);
  }

  function handleImageChange(
    dimIndex: number,
    option: string,
    url: string | null,
  ) {
    const updated = dimensions.map((dim, i) => {
      if (i !== dimIndex) return dim;
      const optionImages = { ...(dim.optionImages ?? {}) };
      if (url) {
        optionImages[option] = url;
      } else {
        delete optionImages[option];
      }
      return { ...dim, optionImages };
    });
    onChange(updated);
  }

  if (!decided) {
    return (
      <div className="space-y-3">
        <div className="space-y-0.5">
          <p className="text-foreground text-sm font-medium">
            Add photos per option?
          </p>
          <p className="text-muted-foreground text-xs">
            Pick which dimensions need their own photo (e.g. Color but not
            Size).
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {dimensions.map((dim) => {
            const active = selected.includes(dim.name);
            return (
              <button
                key={dim.name}
                type="button"
                onClick={() => toggleDim(dim.name)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                    : "border-border bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {active ? `✓ ${dim.name}` : dim.name}
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          onClick={confirm}
          className="bg-brand-orange hover:bg-brand-orange/90 h-10 w-full rounded-xl"
        >
          {selected.length === 0 ? "Skip — no option photos" : "Continue"}
        </Button>
      </div>
    );
  }

  const activeDimensions = dimensions.filter((d) => selected.includes(d.name));
  if (activeDimensions.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Option photos
        </p>
        <button
          type="button"
          onClick={() => setDecided(false)}
          className="text-muted-foreground text-xs underline underline-offset-2"
        >
          Change
        </button>
      </div>

      {activeDimensions.map((dim) => {
        const dimIndex = dimensions.findIndex((d) => d.name === dim.name);
        return (
          <div key={dim.name} className="space-y-2">
            <p className="text-foreground text-sm font-medium">{dim.name}</p>
            <div className="-mx-4 overflow-x-auto px-4">
              <div className="flex gap-3">
                {dim.options.map((option) => (
                  <div key={option} className="w-20 shrink-0 space-y-1.5">
                    <ImageUploader
                      kind="variant"
                      aspect="aspect-square"
                      value={dim.optionImages?.[option] ?? null}
                      onChange={(url) =>
                        handleImageChange(dimIndex, option, url)
                      }
                    />
                    <p className="text-muted-foreground truncate text-center text-xs">
                      {option}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `cd acroma-web && npm run lint && npm run build`
Expected: PASS. The component is unused at this point but must lint and build.

- [ ] **Step 3: Commit**

```bash
cd acroma-web
git add components/catalog/variant-option-images.tsx
git commit -m "feat(catalog): port VariantOptionImages from mobile"
```

---

## Task 3: Split out `EditProductForm` and update the edit route

The current `components/catalog/product-form.tsx` does double duty for create and edit. We're going to copy its edit-relevant logic into a new `edit-product-form.tsx`, point the edit route at it, and leave `product-form.tsx` in place for now (Task 9 deletes it). This keeps the edit page working at every step.

**Files:**
- Create: `components/catalog/edit-product-form.tsx`
- Modify: `app/dashboard/catalog/[id]/edit/page.tsx`

- [ ] **Step 1: Create `edit-product-form.tsx`**

Create `components/catalog/edit-product-form.tsx` with this content (a trimmed clone of the current form — `mode` prop removed, always edit, `productId` required, `defaults` always provided):

```tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

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

const schema = z.object({
  name: z.string().min(2, "Name is required").max(120),
  description: z.string().max(2000).optional().or(z.literal("")),
  basePrice: z.number().min(0, "Must be 0 or more"),
  stock: z.number().int().min(0).optional(),
  category: z.string().max(40).optional().or(z.literal("")),
  imageUrl: z.string().url().or(z.literal("")).optional(),
  isActive: z.boolean(),
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
};

export function EditProductForm({ productId, defaults }: Props) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [autofilling, startAutofill] = React.useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaults.name ?? "",
      description: defaults.description ?? "",
      basePrice: defaults.basePrice ?? 0,
      stock: defaults.stock ?? 0,
      category: defaults.category ?? "",
      imageUrl: defaults.imageUrl ?? "",
      isActive: defaults.isActive ?? true,
    },
  });

  function autofillFromName() {
    const name = form.getValues("name").trim();
    if (!name) {
      toast.info("Type a product name first");
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
        category: values.category || undefined,
        imageUrl: values.imageUrl || undefined,
        isActive: values.isActive,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Product updated");
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
                    <Sparkles />
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

        <div className="grid gap-5 sm:grid-cols-3">
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
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input
                    className="h-11"
                    placeholder="Optional"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
```

- [ ] **Step 2: Update the edit page import**

Edit `app/dashboard/catalog/[id]/edit/page.tsx`:

Replace the line:
```tsx
import { ProductForm } from "@/components/catalog/product-form";
```
with:
```tsx
import { EditProductForm } from "@/components/catalog/edit-product-form";
```

Replace the JSX block:
```tsx
<ProductForm
  mode="edit"
  productId={id}
  defaults={{
    name: product.name,
    description: product.description ?? "",
    basePrice: product.basePrice,
    stock: product.stock,
    category: product.category ?? "",
    imageUrl: product.imageUrl ?? "",
    isActive: product.isActive,
  }}
/>
```
with:
```tsx
<EditProductForm
  productId={id}
  defaults={{
    name: product.name,
    description: product.description ?? "",
    basePrice: product.basePrice,
    stock: product.stock,
    category: product.category ?? "",
    imageUrl: product.imageUrl ?? "",
    isActive: product.isActive,
  }}
/>
```

- [ ] **Step 3: Verify lint + build**

Run: `cd acroma-web && npm run lint && npm run build`
Expected: PASS. The edit route now uses `EditProductForm`. `ProductForm` is still imported by the new-product page (via `NewProductTabs`) — that import stays intact for now, deleted in Task 9.

- [ ] **Step 4: Commit**

```bash
cd acroma-web
git add components/catalog/edit-product-form.tsx app/dashboard/catalog/\[id\]/edit/page.tsx
git commit -m "refactor(catalog): split EditProductForm out of ProductForm"
```

---

## Task 4: Create `ManualProductForm` (controlled, create-mode)

**Files:**
- Create: `components/catalog/manual-product-form.tsx`

This is a plain controlled form. No `react-hook-form`, no submit button, no image field, no autofill. Validation happens at submit time on the page (just "name + price required"); the inputs themselves are forgiving. Number-ish fields are kept as strings in `formValues` (per `ProductFormValues`) so typing isn't fought.

- [ ] **Step 1: Create the file**

Create `components/catalog/manual-product-form.tsx`:

```tsx
"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { ProductFormValues } from "@/lib/api/types";

type Props = {
  values: ProductFormValues;
  onChange: (next: ProductFormValues) => void;
};

/**
 * Controlled create-mode product form. Image upload, save, and variants
 * live on the parent page; this component only renders the scalar fields.
 */
export function ManualProductForm({ values, onChange }: Props) {
  function set<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="product-name">Name</Label>
        <Input
          id="product-name"
          className="h-11"
          autoFocus
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="product-description">Description</Label>
        <textarea
          id="product-description"
          rows={3}
          className="border-input bg-background hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-ring/40 placeholder:text-muted-foreground min-h-[80px] w-full resize-y rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="product-price">Price</Label>
          <Input
            id="product-price"
            type="number"
            inputMode="decimal"
            step="0.01"
            min={0}
            className="h-11 tabular-nums"
            value={values.basePrice}
            onChange={(e) => set("basePrice", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-stock">Stock</Label>
          <Input
            id="product-stock"
            type="number"
            inputMode="numeric"
            min={0}
            className="h-11 tabular-nums"
            value={values.stock}
            onChange={(e) => set("stock", e.target.value)}
            disabled={values.hasVariants}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-category">Category</Label>
          <Input
            id="product-category"
            className="h-11"
            placeholder="Optional"
            value={values.category}
            onChange={(e) => set("category", e.target.value)}
          />
        </div>
      </div>

      <div className="border-border/70 bg-muted/30 flex items-center justify-between rounded-xl border p-4">
        <div>
          <Label htmlFor="product-active">Visible to customers</Label>
          <p className="text-muted-foreground text-xs">
            Hidden products won&apos;t appear in AI replies or menus.
          </p>
        </div>
        <input
          id="product-active"
          type="checkbox"
          className="size-5 accent-[var(--brand-orange)]"
          checked={values.isActive}
          onChange={(e) => set("isActive", e.target.checked)}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `cd acroma-web && npm run lint && npm run build`
Expected: PASS. Component is unused at this point but must compile.

- [ ] **Step 3: Commit**

```bash
cd acroma-web
git add components/catalog/manual-product-form.tsx
git commit -m "feat(catalog): add controlled ManualProductForm"
```

---

## Task 5: Create `DescribeWithAiPanel`

**Files:**
- Create: `components/catalog/describe-with-ai-panel.tsx`

Stateless from the page's POV: takes the inputs it needs (`originalDescription`, `parsedPreview`, pending flags) and the actions (`onParse`, `onRefine`, `onEditOriginal`). Two sub-states (pre-parse / post-parse) determined by `parsedPreview`.

- [ ] **Step 1: Create the file**

Create `components/catalog/describe-with-ai-panel.tsx`:

```tsx
"use client";

import * as React from "react";
import { Loader2, Pencil, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ParsedProduct } from "@/lib/api/types";

const MAX_LENGTH = 800;
const MIN_LENGTH = 3;

type Props = {
  parsedPreview: ParsedProduct | null;
  originalDescription: string;
  parsing: boolean;
  refining: boolean;
  onParse: (description: string) => void;
  onRefine: (followUp: string) => void;
  onEditOriginal: () => void;
};

export function DescribeWithAiPanel({
  parsedPreview,
  originalDescription,
  parsing,
  refining,
  onParse,
  onRefine,
  onEditOriginal,
}: Props) {
  if (parsedPreview) {
    return (
      <PostParse
        originalDescription={originalDescription}
        refining={refining}
        onRefine={onRefine}
        onEditOriginal={onEditOriginal}
      />
    );
  }
  return <PreParse parsing={parsing} initialText={originalDescription} onParse={onParse} />;
}

function PreParse({
  parsing,
  initialText,
  onParse,
}: {
  parsing: boolean;
  initialText: string;
  onParse: (description: string) => void;
}) {
  const [text, setText] = React.useState(initialText);

  return (
    <div className="space-y-4">
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
          onClick={() => onParse(text.trim())}
          disabled={text.trim().length < MIN_LENGTH || parsing}
          className="bg-brand-orange hover:bg-brand-orange/90 h-10 gap-2 rounded-xl px-5"
        >
          {parsing ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {parsing ? "Understanding…" : "Parse with AI"}
        </Button>
      </div>
    </div>
  );
}

function PostParse({
  originalDescription,
  refining,
  onRefine,
  onEditOriginal,
}: {
  originalDescription: string;
  refining: boolean;
  onRefine: (followUp: string) => void;
  onEditOriginal: () => void;
}) {
  const [followUp, setFollowUp] = React.useState("");

  function handleRefine() {
    const trimmed = followUp.trim();
    if (trimmed.length < MIN_LENGTH || refining) return;
    onRefine(trimmed);
    setFollowUp("");
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Your description
          </p>
          <button
            type="button"
            onClick={onEditOriginal}
            className="text-muted-foreground inline-flex items-center gap-1 text-xs"
          >
            <Pencil className="size-3" />
            Edit
          </button>
        </div>
        <div className="border-border/70 bg-muted/40 rounded-xl border px-4 py-3">
          <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
            {originalDescription}
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Tell AI what to change
        </p>
        <textarea
          value={followUp}
          onChange={(e) => setFollowUp(e.target.value.slice(0, MAX_LENGTH))}
          rows={3}
          placeholder={
            'e.g. "Change the price to GHS 450"\n"Add a medium size"\n"Stock is 15, not 0"'
          }
          className="border-input bg-background hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-ring/40 placeholder:text-muted-foreground min-h-[80px] w-full resize-y rounded-xl border p-3 text-sm leading-relaxed transition-colors focus-visible:ring-2 focus-visible:outline-none"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleRefine}
          disabled={followUp.trim().length < MIN_LENGTH || refining}
          className="bg-brand-orange hover:bg-brand-orange/90 h-10 gap-2 rounded-xl px-5"
        >
          {refining ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {refining ? "Applying…" : "Refine with AI"}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `cd acroma-web && npm run lint && npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
cd acroma-web
git add components/catalog/describe-with-ai-panel.tsx
git commit -m "feat(catalog): add DescribeWithAiPanel with refine flow"
```

---

## Task 6: Rewrite `NewProductTabs` as a controlled segmented control

**Files:**
- Rewrite: `components/catalog/new-product-tabs.tsx`

It's currently the orchestrator. We're stripping it down to a dumb segmented control. The orchestrator role moves to the page in Task 8.

- [ ] **Step 1: Replace the file contents**

Overwrite `components/catalog/new-product-tabs.tsx`:

```tsx
"use client";

import * as React from "react";
import { Sparkles, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export type NewProductMode = "describe" | "manual";

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
```

- [ ] **Step 2: Verify lint + build**

Run: `cd acroma-web && npm run lint && npm run build`

Expected: BUILD WILL FAIL because `app/dashboard/catalog/new/page.tsx` still calls `<NewProductTabs />` with no props. **This is expected and gets fixed in Task 8.** Note the failure but proceed.

If you want a green build at this checkpoint, do NOT rewrite `NewProductTabs` until Task 8. Otherwise, accept the temporary break and move on.

- [ ] **Step 3: Commit**

```bash
cd acroma-web
git add components/catalog/new-product-tabs.tsx
git commit -m "refactor(catalog): make NewProductTabs a controlled segmented control"
```

---

## Task 7: Create `useNewProduct` hook

**Files:**
- Create: `hooks/use-new-product.ts`

This hook owns parse/refine/commit handlers and returns the page's state + actions. Keeping it separate keeps `page.tsx` under the 150-line hard cap.

- [ ] **Step 1: Create the file**

Create `hooks/use-new-product.ts`:

```ts
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  parseProductAction,
} from "@/lib/api/products-ai-actions";
import { createProductAction } from "@/lib/api/products-actions";
import { saveVariantsAction } from "@/lib/api/variants-actions";
import type {
  ParsedProduct,
  ProductFormValues,
} from "@/lib/api/types";

const EMPTY_VALUES: ProductFormValues = {
  name: "",
  description: "",
  basePrice: "",
  stock: "",
  category: "",
  imageUrl: "",
  isActive: true,
  hasVariants: false,
  variantDimensions: [],
  variants: [],
};

function parsedToFormValues(p: ParsedProduct, prev: ProductFormValues): ProductFormValues {
  return {
    name: p.name,
    description: p.description ?? "",
    basePrice: String(p.basePrice),
    stock: String(p.stock ?? 0),
    category: p.category ?? "",
    imageUrl: prev.imageUrl, // never overwrite uploaded image
    isActive: prev.isActive,
    hasVariants: p.hasVariants,
    variantDimensions: p.variantDimensions,
    variants: p.variants.map((v) => ({
      attributes: v.attributes,
      stock: v.stock,
      priceOverride: v.priceOverride,
      isActive: true,
    })),
  };
}

export type NewProductMode = "describe" | "manual";

export function useNewProduct() {
  const router = useRouter();

  const [mode, setMode] = React.useState<NewProductMode>("describe");
  const [formValues, setFormValues] = React.useState<ProductFormValues>(EMPTY_VALUES);
  const [parsedPreview, setParsedPreview] = React.useState<ParsedProduct | null>(null);
  const [originalDescription, setOriginalDescription] = React.useState("");

  const [parsing, startParse] = React.useTransition();
  const [refining, startRefine] = React.useTransition();
  const [saving, startSave] = React.useTransition();

  function parse(description: string) {
    if (!description) return;
    startParse(async () => {
      const result = await parseProductAction({ description });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setParsedPreview(result.data);
      setOriginalDescription(description);
      setFormValues((prev) => parsedToFormValues(result.data, prev));
    });
  }

  function refine(followUp: string) {
    if (!followUp || !parsedPreview) return;
    startRefine(async () => {
      const result = await parseProductAction({
        description: originalDescription,
        followUp,
        current: parsedPreview as unknown as Record<string, unknown>,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setParsedPreview(result.data);
      setFormValues((prev) => parsedToFormValues(result.data, prev));
    });
  }

  /** Returns to the pre-parse state so the merchant can re-edit the prompt. */
  function editOriginal() {
    setParsedPreview(null);
  }

  /**
   * Form is valid for save when there's a name and a non-negative numeric price.
   * (Variants can be empty — the product page lets the merchant add them later.)
   */
  const canSave = React.useMemo(() => {
    if (formValues.name.trim() === "") return false;
    const price = Number(formValues.basePrice);
    if (!Number.isFinite(price) || price < 0) return false;
    return true;
  }, [formValues.name, formValues.basePrice]);

  function commit() {
    if (!canSave) return;
    startSave(async () => {
      const create = await createProductAction({
        name: formValues.name.trim(),
        description: formValues.description.trim() || undefined,
        basePrice: Number(formValues.basePrice),
        stock: formValues.hasVariants
          ? 0
          : Number.isFinite(Number(formValues.stock))
            ? Number(formValues.stock)
            : 0,
        category: formValues.category.trim() || undefined,
        imageUrl: formValues.imageUrl.trim() || undefined,
        isActive: formValues.isActive,
      });
      if (!create.ok) {
        toast.error(create.error);
        return;
      }

      if (formValues.hasVariants && formValues.variantDimensions.length > 0) {
        const variantsResult = await saveVariantsAction(create.data.id, {
          dimensions: formValues.variantDimensions,
          variants: formValues.variants.map((v) => ({
            attributes: v.attributes,
            stock: v.stock,
            priceOverride: v.priceOverride,
            isActive: v.isActive,
          })),
        });
        if (!variantsResult.ok) {
          toast.error(variantsResult.error);
          return;
        }
      }

      toast.success("Product added");
      router.replace(`/dashboard/catalog/${create.data.id}`);
      router.refresh();
    });
  }

  return {
    mode,
    setMode,
    formValues,
    setFormValues,
    parsedPreview,
    originalDescription,
    parsing,
    refining,
    saving,
    canSave,
    parse,
    refine,
    editOriginal,
    commit,
  };
}
```

- [ ] **Step 2: Verify lint + build**

Run: `cd acroma-web && npm run lint && npm run build`
Expected: still failing because of the Task 6 break to `NewProductTabs`. **This is expected** — Task 8 fixes it.

- [ ] **Step 3: Commit**

```bash
cd acroma-web
git add hooks/use-new-product.ts
git commit -m "feat(catalog): add useNewProduct hook"
```

---

## Task 8: Rewrite `app/dashboard/catalog/new/page.tsx`

**Files:**
- Rewrite: `app/dashboard/catalog/new/page.tsx`

This becomes a client component. The header and metadata are split: `metadata` only works in server components, so we move title to a layout-level concern via a parent server component, OR drop the static `Metadata` export and set `<title>` via the document — simplest path: keep an outer server component that wraps a client component owning the interactivity.

- [ ] **Step 1: Create the orchestrator client component**

Create `components/catalog/new-product-page.tsx`:

```tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/shared/image-uploader";
import { NewProductTabs } from "@/components/catalog/new-product-tabs";
import { DescribeWithAiPanel } from "@/components/catalog/describe-with-ai-panel";
import { ManualProductForm } from "@/components/catalog/manual-product-form";
import { VariantOptionImages } from "@/components/catalog/variant-option-images";
import { useNewProduct } from "@/hooks/use-new-product";

export function NewProductPageClient() {
  const router = useRouter();
  const np = useNewProduct();

  const showVariantImages =
    np.formValues.hasVariants && np.formValues.variantDimensions.length > 0;

  return (
    <div className="space-y-6">
      <NewProductTabs mode={np.mode} onModeChange={np.setMode} />

      {np.mode === "describe" ? (
        <DescribeWithAiPanel
          parsedPreview={np.parsedPreview}
          originalDescription={np.originalDescription}
          parsing={np.parsing}
          refining={np.refining}
          onParse={np.parse}
          onRefine={np.refine}
          onEditOriginal={np.editOriginal}
        />
      ) : (
        <ManualProductForm
          values={np.formValues}
          onChange={np.setFormValues}
        />
      )}

      <div className="space-y-2">
        <Label>Product image</Label>
        <ImageUploader
          kind="product"
          aspect="aspect-[4/3]"
          value={np.formValues.imageUrl || null}
          onChange={(url) =>
            np.setFormValues({ ...np.formValues, imageUrl: url ?? "" })
          }
        />
      </div>

      {showVariantImages ? (
        <VariantOptionImages
          dimensions={np.formValues.variantDimensions}
          onChange={(dims) =>
            np.setFormValues({ ...np.formValues, variantDimensions: dims })
          }
        />
      ) : null}

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={np.saving}
          className="rounded-xl"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={np.commit}
          disabled={!np.canSave || np.saving}
          className="bg-brand-orange hover:bg-brand-orange/90 h-10 gap-2 rounded-xl px-5"
        >
          {np.saving ? <Loader2 className="animate-spin" /> : null}
          Add product
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite `app/dashboard/catalog/new/page.tsx`**

Replace the entire contents of `app/dashboard/catalog/new/page.tsx` with:

```tsx
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { NewProductPageClient } from "@/components/catalog/new-product-page";

export const metadata: Metadata = { title: "New product · Acroma" };

export default function NewProductPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header className="space-y-2">
        <Link
          href="/dashboard/catalog"
          className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1 text-xs font-medium"
        >
          <ChevronLeft className="size-4" />
          Catalog
        </Link>
        <h1 className="font-display text-foreground text-3xl font-medium tracking-tight">
          Add a product
        </h1>
      </header>
      <NewProductPageClient />
    </div>
  );
}
```

- [ ] **Step 3: Verify lint + build**

Run: `cd acroma-web && npm run lint && npm run build`
Expected: PASS. The build break introduced in Task 6 is now fixed because the page no longer renders `<NewProductTabs />` without props — the new client orchestrator does it correctly.

- [ ] **Step 4: Commit**

```bash
cd acroma-web
git add components/catalog/new-product-page.tsx app/dashboard/catalog/new/page.tsx
git commit -m "feat(catalog): rewrite new-product page with shared state"
```

---

## Task 9: Delete obsolete files

**Files:**
- Delete: `components/catalog/quick-add-form.tsx`
- Delete: `components/catalog/product-form.tsx`

- [ ] **Step 1: Confirm nothing imports them**

Run from `acroma-web/`:

```bash
grep -r "quick-add-form\|@/components/catalog/quick-add-form" app components hooks lib 2>/dev/null
grep -r "@/components/catalog/product-form\|from \"./product-form\"" app components hooks lib 2>/dev/null
```

Expected: no matches in either grep. If any match remains, fix the import first; do not proceed to deletion.

- [ ] **Step 2: Delete the files**

```bash
cd acroma-web
rm components/catalog/quick-add-form.tsx components/catalog/product-form.tsx
```

- [ ] **Step 3: Verify lint + build**

Run: `cd acroma-web && npm run lint && npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
cd acroma-web
git add -A components/catalog
git commit -m "chore(catalog): remove obsolete product-form and quick-add-form"
```

---

## Task 10: Final verification

**Files:** none modified.

- [ ] **Step 1: Run the full quality gate**

```bash
cd acroma-web
npm run lint
npm run typecheck
npm run build
npm run format
```

All four must pass.

- [ ] **Step 2: Manual browser verification (per `acroma-web/CLAUDE.md`)**

Start the dev server: `cd acroma-web && npm run dev`. Open `http://localhost:3000/dashboard/catalog/new` (auth required). Walk the spec's acceptance scenarios:

1. **Initial render:** both tabs visible, "Describe with AI" active, textarea empty.
2. **Tab persistence (empty):** switch to Manual, type "Test" in name, switch to AI, switch back to Manual — "Test" still there.
3. **Parse:** in Describe, paste `Nike Air Max in black, sizes 8 to 12, GHS 850. White also available, only sizes 9 to 11.` → click Parse. Panel switches to post-parse view; "Your description" block shows the source; refine textarea is empty.
4. **Cross-mode visibility:** switch to Manual → name/price/category prefilled from AI parse.
5. **Manual edit + return:** in Manual, change price to 900. Switch back to Describe → original description and refine textarea still visible.
6. **Refine:** type `set price to 950` in refine textarea → click Refine. Switch to Manual → price is now 950.
7. **Variant photos:** because the parse produced variants (color × size), the **Variant photos** section appears below the active panel. Pick "Color" → confirm → upload two images (one per option). The "Size" dimension does not show pickers.
8. **Product image:** upload a hero image. Switch tabs — image survives.
9. **Edit original:** click the "Edit" link in the post-parse view → returns to pre-parse state with textarea pre-filled. `formValues` and uploaded images are NOT cleared.
10. **Save:** click Add product → toast "Product added", redirect to `/dashboard/catalog/<id>`. The product page shows the hero image; variants page shows the per-option photos.
11. **Manual-only:** in a fresh page load, never touch Describe. Type a name, price, optional image. Save. Same redirect, no variants on the resulting product.
12. **Cancel:** in any state, click Cancel → `router.back()`, no commit.
13. **Validation:** with no name OR price not numeric, the "Add product" button is disabled.
14. **Edit page regression:** open an existing product's edit page (`/dashboard/catalog/<id>/edit`), change the description, save. Behaves as today.

Verify each in **light + dark, mobile + desktop** viewports.

- [ ] **Step 3: Document any issues**

If anything fails the manual checks, do not commit a "done" marker. Report the specific scenario that failed; fix or escalate.

- [ ] **Step 4: Final commit (only if needed)**

If formatting changed any files in step 1:

```bash
cd acroma-web
git add -A
git commit -m "chore: format after new-product redesign"
```

---

## Self-review notes

Spec coverage:

- Lifted state (page-owns-`formValues`) → Task 7 (hook) + Task 8 (page).
- Two tabs preserved with shared state → Task 6 + Task 8.
- Two-stage Describe panel (pre/post-parse) with refine textarea → Task 5.
- Manual tab as plain controlled form → Task 4.
- Image upload at page level (product + variant photos) → Task 2 + Task 8.
- `VariantOptionImages` ported with two-step UX → Task 2.
- Edit page split into its own form → Task 3.
- `autofillProductAction` retained, "Auto-fill from name" only on edit form → Task 3 keeps it; Task 4 omits it.
- `quick-add-form.tsx` and old `product-form.tsx` removed → Task 9.
- `ProductFormValues` type added → Task 1.
- Save calls `createProductAction` then `saveVariantsAction` carrying `optionImages` → Task 7 (`commit`).
- Cancel → `router.back()` → Task 8.

Type consistency: `NewProductMode` is exported from `new-product-tabs.tsx` AND from `use-new-product.ts`. The page imports the hook's version; the tabs file declares its own (string union, identical). Both are kept local to avoid a circular import. If a future refactor centralises it, fine — for now both are deliberate.

`ProductVariantFormRow` is used by `ProductFormValues` (Task 1) and `useNewProduct.commit` (Task 7); shape matches `saveVariantsAction`'s `SaveVariantsInput.variants` element shape (attributes, stock, priceOverride, isActive).

`parsedToFormValues` (Task 7) preserves `imageUrl` and `isActive` across re-parses so AI doesn't blow away an uploaded photo or a deliberate "Visible to customers" toggle.

Hard caps (`acroma-web/CLAUDE.md`):
- `app/dashboard/catalog/new/page.tsx` — 25 lines (well under 150).
- `components/catalog/new-product-page.tsx` — ~75 lines (under 250).
- `hooks/use-new-product.ts` — ~135 lines (under 150).
- All other new files comfortably under their caps.
