# New Product Page — AI + Manual Coexistence

**Date:** 2026-05-07
**Surface:** `app/dashboard/catalog/new`

## Problem

The current page has two mutually-exclusive tabs (`Describe with AI` and `Manual`) wired as sibling components, each owning its own state. This produces two complaints:

1. The AI parse result is rendered as a sealed read-only preview — the merchant can't tweak a single field after parsing.
2. Switching tabs discards everything in the other tab. Edits made in Manual are gone the moment you peek at AI, and vice versa.

The mobile app (`Documents/quickshop/app/(app)/products/new.tsx`) already solves this. Web should adopt the same pattern for cross-platform consistency and to inherit a UX that's been validated with users.

## Solution — Port the mobile pattern

Two tabs are kept, but the data they operate on is lifted to the page so switching never destroys work. The Manual tab becomes the "edit one field at a time" surface; the AI tab gains a chat-style refinement loop instead of a frozen preview.

### Page-level state

`app/dashboard/catalog/new/page.tsx` becomes a client component that owns:

- `mode: "describe" | "manual"`
- `formValues: ProductFormValues` — the full editable shape, shared by both tabs.
- `parsedPreview: ParsedProduct | null` — last AI result (drives the post-parse Quick Add UI).
- `originalDescription: string` — the original textarea text, kept so refinements can be re-sent.

Switching `mode` mutates nothing else. Both tabs read and write the same `formValues`.

`ProductFormValues` is added to `lib/api/types.ts`, modelled on the mobile shape:

```ts
type ProductFormValues = {
  name: string;
  description: string;
  basePrice: string; // string so the input never fights the user mid-typing
  stock: string;
  category: string;
  imageUrl: string;
  isActive: boolean;
  hasVariants: boolean;
  variantDimensions: VariantDimension[];
  variants: ProductVariantInput[];
};
```

### Component layout

Replace `components/catalog/new-product-tabs.tsx` and `components/catalog/quick-add-form.tsx`. Refactor `components/catalog/product-form.tsx` into a controlled component (`ManualProductForm`).

```
app/dashboard/catalog/new/page.tsx          // client component, owns state, renders header + tabs + active panel + image sections + Save
components/catalog/
  new-product-tabs.tsx                      // dumb segmented control (mode + setMode props)
  describe-with-ai-panel.tsx                // pre/post-parse Quick Add UX (replaces quick-add-form.tsx)
  manual-product-form.tsx                   // controlled form (replaces product-form.tsx for create mode)
  variant-option-images.tsx                 // ported from mobile; per-dimension photo pickers
```

The existing `product-form.tsx` is also used by `app/dashboard/catalog/[id]/edit/page.tsx`. That route keeps its own self-contained form (with its own `react-hook-form` instance) — we are NOT generalising the edit flow as part of this change. We will either keep the current `ProductForm` for edit and introduce a new `ManualProductForm` for create, OR rename and split. Decision below.

**Decision — file split:**

- Rename current `product-form.tsx` → `edit-product-form.tsx` and trim it to only what edit needs (no need for create-mode branching there).
- New `manual-product-form.tsx` is the controlled create-mode form: takes `values` + `onChange` props instead of using `react-hook-form` internally.

This avoids one file straddling both modes and keeps each focused.

### Describe-with-AI panel — two stages

**Pre-parse (no `parsedPreview` yet):**

- Textarea (existing placeholder copy stays).
- "Parse with AI" button.
- Same 800-char cap as today.

On parse: call `parseProductAction({ description })`. On success: set `parsedPreview`, set `originalDescription = text`, and merge the parsed shape into `formValues` (overwriting). Errors surface via `toast.error` (existing pattern).

**Post-parse (`parsedPreview` is set):**

- A read-only block showing `originalDescription`, with an "Edit" link in the corner. Clicking Edit clears `parsedPreview` and `originalDescription`, returning the panel to the pre-parse state with the textarea pre-filled with the previous text. (Note: clearing `parsedPreview` does NOT clear `formValues` — the merchant's data stays.)
- A second textarea labelled *"Tell AI what to change"* with example placeholder copy (`'e.g. "Change the price to GHS 450"\n"Add a medium size"\n"The stock is 15, not 0"'`).
- "Refine with AI" button.

On refine: call `parseProductAction({ description: originalDescription, followUp, current: formValues as Record<string, unknown> })`. On success: overwrite `parsedPreview` and `formValues` with the new parsed shape. Clear the follow-up textarea. Errors → toast.

### Manual tab

Renders `ManualProductForm` driven by `formValues` + `onChange`. All non-image scalar fields the existing form has, behaving identically. Removed:

- The "Auto-fill from name" button on the name field. The new top-level AI flow supersedes it. (`autofillProductAction` stays in the codebase — still used elsewhere, or removed in a follow-up.)
- The image uploader. Image upload is hoisted to the page level (see below), so it lives outside both tab panels.

The form's submit button is removed from the form itself; submission is handled by the page-level "Add product" button (see Save below).

### Image sections (page-level, both modes)

Both image surfaces live on the page itself, below whichever panel is active and above Save. They are bound to `formValues` and are unaffected by mode switches.

**Product image** — always visible. Renders `ImageUploader` (existing) bound to `formValues.imageUrl`. Same UX as today's Manual form image field.

**Variant photos** — visible only when `formValues.hasVariants && formValues.variantDimensions.length > 0`. Renders a new `VariantOptionImages` component ported from mobile (`Documents/quickshop/components/shared/VariantOptionImages.tsx`). Two-step UX:

1. Ask which dimensions need per-option photos (e.g. "Color" but not "Size") via toggle chips.
2. After confirm, show a row of `ImageUploader`s per option for each selected dimension, writing into `dimension.optionImages[option]`.

The component takes `dimensions: VariantDimension[]` + `onChange: (dims: VariantDimension[]) => void`, mirroring the mobile API. Internally it uses web's existing `ImageUploader` instead of mobile's `ImagePickerButton`.

This placement differs from mobile (which puts the product image inline in Manual and as a separate Card after parse in Quick Add). Hoisting to the page is cleaner on web because:
- One binding, one component, both modes benefit.
- Mode switch doesn't disturb image state.
- Discoverable immediately after parsing — no need to switch to Manual to upload photos.

### Save

A single "Add product" button lives at the bottom of the page (not inside either tab panel). It is enabled when `formValues.name.trim()` is non-empty AND `formValues.basePrice` parses to a non-negative number.

On click:

1. Call `createProductAction` with the scalar fields (including `imageUrl`).
2. If `formValues.hasVariants && formValues.variantDimensions.length > 0`, call `saveVariantsAction` with `dimensions` (carrying any `optionImages` set in the Variant photos section) and the variant list.
3. `toast.success("Product added")`, navigate to `/dashboard/catalog/${id}`.

Identical to today's commit logic — just lifted up a level.

### Cancel

A "Cancel" ghost button next to Save calls `router.back()`. Same as today's manual form cancel.

## Out of scope

- Per-field "AI suggests" inline conflict UI (rejected in favour of mobile pattern).
- Per-variant-row dirty tracking (same).
- Examples chips per business type (mobile has them; web can add later — current placeholder text is sufficient for v1).
- Generalising the edit-product flow.
- Removing `autofillProductAction`.

## Files touched

- **New:** `app/dashboard/catalog/new/page.tsx` (rewritten as client component owning state).
- **New:** `components/catalog/describe-with-ai-panel.tsx`.
- **New:** `components/catalog/manual-product-form.tsx`.
- **New:** `components/catalog/variant-option-images.tsx` (port of mobile `VariantOptionImages`, using web's `ImageUploader`).
- **Renamed/trimmed:** `components/catalog/product-form.tsx` → `components/catalog/edit-product-form.tsx`. Update import in `app/dashboard/catalog/[id]/edit/page.tsx`.
- **Updated:** `components/catalog/new-product-tabs.tsx` becomes a controlled segmented control (`mode` + `setMode` props).
- **Removed:** `components/catalog/quick-add-form.tsx`.
- **Updated:** `lib/api/types.ts` — add `ProductFormValues`.

## Acceptance

1. On the page with no input, both tabs render. Switching tabs is instant and stateful.
2. Type "Nike Air Max GHS 850" in the Describe textarea, parse → form fills, `parsedPreview` shows the source description block + refine textarea.
3. Switch to Manual → all parsed values are present in editable fields. Edit price to 900.
4. Switch back to Describe → source description and refine textarea still there.
5. Type "set price to 950" in the refine textarea, click Refine → form values update to 950. Switch to Manual, confirm 950.
6. Type "add medium size" in refine → variant rows update.
7. After parsing in Describe mode, the **Product image** uploader is visible on the page. Upload an image — `formValues.imageUrl` is set. Switch to Manual; the image is still attached.
8. After parsing a multi-variant product (e.g. shoes in black/white × sizes 8–10), the **Variant photos** section appears. Toggle "Color" → confirm → upload a black photo and a white photo. `formValues.variantDimensions[color].optionImages = { black: ..., white: ... }`.
9. Click Add product → product is created with `imageUrl` and variants are saved with `optionImages` populated; redirect to product page.
10. Cancel any time → no commit; `router.back()`.
11. Manual-only flow (never touch Describe): type a name and price, optionally upload an image, save. Works identically to today.

## Quality bar (per repo CLAUDE.md)

- `npm run lint` passes.
- `npm run build` passes.
- Light + dark, mobile + desktop verified in the browser before claiming done.
- All files under hard size caps. The page file likely splits cleanly given each panel is its own component.
