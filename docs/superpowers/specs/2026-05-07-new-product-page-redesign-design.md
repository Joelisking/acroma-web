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
app/dashboard/catalog/new/page.tsx        // client component, owns state, renders header + tabs + active panel + Save
components/catalog/
  new-product-tabs.tsx                    // dumb segmented control (mode + setMode props)
  describe-with-ai-panel.tsx              // pre/post-parse Quick Add UX (replaces quick-add-form.tsx)
  manual-product-form.tsx                 // controlled form (replaces product-form.tsx for create mode)
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

Renders `ManualProductForm` driven by `formValues` + `onChange`. All fields the existing form has, behaving identically. Removed:

- The "Auto-fill from name" button on the name field. The new top-level AI flow supersedes it. (`autofillProductAction` stays in the codebase — still used elsewhere, or removed in a follow-up.)

The form's submit button is removed from the form itself; submission is handled by the page-level "Add product" button (see Save below).

### Image upload

The image uploader stays in the Manual tab (always available). It does **not** appear in the Describe-with-AI panel. AI doesn't infer images, so showing the uploader there is noise. If a merchant wants to attach an image, they switch to Manual.

This differs from mobile (where the image card appears below the parsed preview in Quick Add). On mobile, switching tabs is friction; on web with a `max-w-2xl` page, the Manual tab is one click away and already shows the parsed values pre-filled. Keeping image upload in one place is simpler.

### Save

A single "Add product" button lives at the bottom of the page (not inside either tab panel). It is enabled when `formValues.name.trim()` is non-empty AND `formValues.basePrice` parses to a non-negative number.

On click:

1. Call `createProductAction` with the scalar fields.
2. If `formValues.hasVariants && formValues.variantDimensions.length > 0`, call `saveVariantsAction` with the variant list.
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
- Image upload in the Describe-with-AI panel.

## Files touched

- **New:** `app/dashboard/catalog/new/page.tsx` (rewritten as client component owning state).
- **New:** `components/catalog/describe-with-ai-panel.tsx`.
- **New:** `components/catalog/manual-product-form.tsx`.
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
7. Click Add product → product is created with the current form values; redirect to product page.
8. Cancel any time → no commit; `router.back()`.
9. Manual-only flow (never touch Describe): type a name and price, save. Works identically to today.

## Quality bar (per repo CLAUDE.md)

- `npm run lint` passes.
- `npm run build` passes.
- Light + dark, mobile + desktop verified in the browser before claiming done.
- All files under hard size caps. The page file likely splits cleanly given each panel is its own component.
