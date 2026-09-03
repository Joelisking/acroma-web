# Acroma — Engineering Guide

Acroma is the AI-powered order management and customer service layer for
commerce in Ghana and across West Africa. We start with food businesses
because that's where the pain is sharpest, but the platform is built for
**general commerce** — retail, fashion, beauty, services, anywhere a
business sells through WhatsApp (and later Instagram + Telegram). Acroma
takes orders, answers product questions, collects MoMo payments, and gives
the owner a live dashboard with full human override.

Design and copy decisions must not assume "restaurant" or "menu." Use
neutral commerce language — *catalog*, *items*, *orders*, *customers*,
*merchant* — and let food-specific UI live behind feature flags or
verticals, never in core primitives.

This file is the source of truth for how code in this repository is written.
Read it before touching the codebase.

---

## 1. Stack

| Concern        | Choice                                      |
|----------------|---------------------------------------------|
| Framework      | Next.js 16 (App Router, Turbopack)          |
| Runtime        | React 19                                    |
| Language       | TypeScript (strict)                         |
| Styling        | Tailwind CSS v4 + CSS variables             |
| UI Primitives  | **shadcn/ui** (radix-nova) + Radix          |
| Icons          | `lucide-react`                              |
| Theming        | `next-themes` via `<ThemeProvider>`         |
| Fonts          | `Inter` (sans), `Geist Mono` (mono)         |
| Lint / Format  | ESLint (`eslint-config-next`) + Prettier    |
| Hosting        | Vercel (Fluid Compute)                      |

Do not introduce a competing UI library, CSS-in-JS runtime, or alternate router.
If something is missing, install the **shadcn** equivalent first.

---

## 2. Brand System — non-negotiable

Every visual decision must use the brand tokens from `app/globals.css`. Never
hardcode hex colors in components. Reach for the semantic token first, the
brand token second, raw hex never.

### Palette

| Token             | Hex        | Use                                                  |
|-------------------|------------|------------------------------------------------------|
| `brand-orange`    | `#F26F21`  | Primary CTA, the "Acroma" wordmark, key accents      |
| `brand-orange-soft` | `#FFF4ED` | Soft surface tint behind orange icons / callouts    |
| `brand-navy`      | `#1A2942`  | Headings, body text, dark surfaces                   |
| `brand-blue`      | `#2563EB`  | Secondary actions, informational chips, links        |
| `brand-blue-soft` | `#EFF6FF`  | Soft surface tint behind blue icons                  |
| `brand-green`     | `#16A34A`  | Success / growth indicators (e.g. "MOST POPULAR")    |
| `brand-green-soft`| `#ECFDF5`  | Soft surface tint behind green icons                 |

### How to consume

```tsx
// ✅ Good — semantic tokens (preferred)
<Button className="bg-primary text-primary-foreground">Get started</Button>

// ✅ Good — brand tokens when semantic isn't expressive enough
<span className="text-brand-orange">Acroma</span>
<div className="bg-brand-blue-soft text-brand-blue">…</div>

// ❌ Bad — hardcoded colors
<button style={{ background: "#F26F21" }}>Get started</button>
<div className="bg-[#1A2942]">…</div>
```

### Mapping into shadcn semantic tokens

The shadcn variables in `globals.css` are wired to the brand:

- `--primary` → Acroma Orange
- `--secondary` → Acroma Navy
- `--ring` / focus → Acroma Orange
- `--accent` → soft orange tint
- `--foreground` → Acroma Navy
- `--chart-1..5` → orange, blue, navy, green, warm-orange

So `bg-primary`, `text-secondary`, `ring-ring`, etc. all stay on-brand
automatically. Add a new brand-affecting variable to `globals.css` rather than
overriding it in a component.

---

## 3. shadcn-first rule

Before building a primitive, install the shadcn version:

```bash
npm run dlx shadcn@latest add <component>
# or
npx shadcn@latest add <component>
```

- New primitives go in `components/ui/` and stay close to the upstream shadcn
  template — small wrappers, no business logic.
- Compose, don't fork. If `Button` needs a brand variant, extend its `cva`
  variants in place rather than copying the file.
- Compose feature UI from primitives in `components/<feature>/`.

If a piece of UI doesn't exist as a shadcn component (or in the registries
configured in `components.json`), build a minimal one in `components/ui/`
following the same `cva` + `forwardRef` pattern shadcn uses.

### No native browser UI — ever

Acroma never uses the browser's built-in UI. It is unstyled, off-brand, not
themeable, not testable, and shows the origin ("acroma.asera.tech says…").
Every one of these has a shadcn (or Radix) replacement — use it.

| Never | Use instead |
|-------|-------------|
| `window.confirm()` / `window.alert()` | shadcn `AlertDialog` |
| `window.prompt()` | shadcn `Dialog` + `Input` |
| `<input type="date">` / `type="month">` | shadcn `Calendar` in a `Popover` (date picker) |
| `<input type="time">` | shadcn time-picker (compose `Select`s, or a `Popover`) |
| `<input type="datetime-local">` | `Calendar` + time-picker in a `Popover` |
| `<input type="color">` | a shadcn color-picker `Popover` |
| native `<select>` | shadcn `Select` |
| `<details>`/`<summary>` | shadcn `Accordion` / `Collapsible` |

Rules:

- **No `confirm`/`alert`/`prompt`** anywhere in the app. A destructive or
  irreversible action gets an `AlertDialog` with a clear title, a description
  of what is lost, and a labelled confirm button. (The PWA
  `beforeinstallprompt.prompt()` API is unrelated and allowed.)
- **No native date/time/color pickers.** They render the OS widget, ignore the
  theme and dark mode, and can't be brand-styled.
- If the shadcn primitive isn't installed yet, `npx shadcn@latest add <x>`
  (decline overwriting existing `components/ui/*`). If one genuinely doesn't
  exist, build it in `components/ui/` following the shadcn pattern — don't fall
  back to the native element.

---

## 4. File size & modularity — hard rules

We do not ship files with hundreds of lines of mixed concerns. Aim small,
split early.

### Soft / hard limits

| File type                          | Soft cap | Hard cap |
|------------------------------------|----------|----------|
| React component (`.tsx`)           | 150      | 250      |
| Hook (`use-*.ts`)                  | 80       | 150      |
| Utility / lib module               | 120      | 200      |
| Route handler (`route.ts`)         | 100      | 200      |
| `page.tsx` / `layout.tsx`          | 80       | 150      |

When you cross the soft cap, that's a signal to split — not permission to
keep going. Past the hard cap, split *before* committing.

### How to split

- **One component per file.** Co-located helpers are fine if they're tiny and
  only used here. Otherwise extract.
- **Co-locate by feature**, not by type:
  ```
  components/
    ui/                       # shadcn primitives only
    dashboard/
      conversation-list.tsx
      conversation-item.tsx
      conversation-empty.tsx
      use-conversations.ts
      types.ts
  ```
- **Extract sub-components** when a JSX block exceeds ~40 lines or has its own
  state. Name them concretely: `OrderRow`, not `Item`.
- **Lift logic into hooks.** A component that contains 3+ `useEffect`s or
  fetch logic is hiding a hook — extract `use-<thing>.ts`.
- **Lift data shaping into `lib/`.** Components render; they don't transform.
- **Server Components by default**, mark with `"use client"` only when you
  need state, effects, browser APIs, or event handlers.

### Project layout

```
app/
  layout.tsx                  # root layout, fonts, ThemeProvider
  page.tsx                    # marketing root
  (dashboard)/                # auth-gated route group, owner UI
  api/                        # route handlers
components/
  ui/                         # shadcn primitives
  <feature>/                  # feature-scoped components
  theme-provider.tsx
hooks/                        # cross-feature hooks (use-*.ts)
lib/                          # pure utilities, clients, schemas
  utils.ts                    # cn(), formatters
public/
```

---

## 5. React conventions

- **Function components only**, named exports preferred. Default export only
  for `app/**` route files (Next.js requires it).
- **Props are typed inline** with a `Props` type when the component is local.
  Promote to `types.ts` when shared.
- **No `any`.** Use `unknown` + narrowing, or model the type.
- **Server Components by default.** Drop `"use client"` only at the boundary
  that actually needs interactivity, then keep that island small.
- **Keys must be stable.** Never `key={index}` on data that can reorder.
- **Hooks rules:** call at the top, no conditionals; `useEffect` deps must be
  exhaustive (let the lint rule do its job).
- **No prop drilling past 2 levels.** Reach for context, a hook, or a route
  loader.
- **`cn()` from `@/lib/utils`** for conditional classes — not template
  string concatenation.
- **Forms** use `react-hook-form` + `zod` (install via shadcn `form`).
- **Accessibility is not optional:** every interactive element has a
  discernible name; respect `prefers-reduced-motion`; focus rings stay visible
  (we use `--ring` = brand orange).

### Component skeleton

```tsx
import { cn } from "@/lib/utils";

type OrderRowProps = {
  order: Order;
  onSelect?: (id: string) => void;
  className?: string;
};

export function OrderRow({ order, onSelect, className }: OrderRowProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(order.id)}
      className={cn(
        "flex w-full items-center justify-between rounded-md",
        "bg-card text-card-foreground hover:bg-accent",
        "px-4 py-3 transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {/* ... */}
    </button>
  );
}
```

---

## 6. Next.js (App Router) conventions

- Use the **App Router** (`app/`). No `pages/`.
- **Data fetching** happens in Server Components with `fetch` (cached by
  default in Next 16) or in Server Actions. Don't fetch from a client
  component when a server component will do.
- Mutations use **Server Actions** (`"use server"`) wired through
  `<form action={...}>` or `useActionState`. Validate input with `zod`.
- **`proxy.ts`** (not `middleware.ts`) for request interception in Next 16.
  Keep it focused on auth gates, redirects, rewrites — no business logic.
- **Caching:** prefer Next.js Cache Components (`'use cache'`, `cacheLife`,
  `cacheTag`, `updateTag`) over ad-hoc memoization. Tag every cached read so
  you can invalidate it later.
- **Images** must use `next/image` with explicit `width`/`height` or `fill`.
- **Fonts** are loaded via `next/font` in `app/layout.tsx` (already wired:
  Inter + Geist Mono).
- **Metadata** lives in `export const metadata` per route — set it; don't
  ship pages with the default Next title.
- **Loading & error UI:** every route segment that fetches must have
  `loading.tsx` and `error.tsx`.
- **Route handlers** (`app/api/**/route.ts`) stay thin — parse, validate,
  call a function from `lib/`, return. No business logic in the handler.

---

## 7. TypeScript

- `strict: true` stays on. Don't disable it locally.
- Imports use the `@/*` alias — no `../../../` chains.
- Validate all external data (API payloads, form inputs, env vars) with
  `zod`. Trust *only* what passes the schema.
- Centralize shared shapes in `lib/types.ts` or a feature-local `types.ts`.

---

## 8. Styling

- Tailwind utility classes in JSX. No CSS modules unless absolutely necessary.
- **Token order in a className:** layout → box model → typography → color →
  state → motion. Prettier + `prettier-plugin-tailwindcss` enforces sort.
- **No arbitrary color values** (`bg-[#…]`). Use brand or semantic tokens.
- Animations come from `tw-animate-css` and Tailwind's transition utilities.
  Respect `motion-safe:` / `motion-reduce:`.
- Dark mode is class-based (`.dark`), wired through `next-themes`. Test both.

---

## 9. Performance defaults

- Server Components by default — keeps the JS bundle small.
- Dynamic-import heavy client components (charts, editors) with
  `next/dynamic` and a skeleton fallback.
- Stream where you can: `loading.tsx`, `<Suspense>`, route-level streaming.
- Memoize (`useMemo`, `useCallback`, `React.memo`) only with a measured
  reason — don't pre-optimize.
- Use `next/image` for every raster asset; set `priority` only on LCP.
- Cache reads with Cache Components; tag them; invalidate via `updateTag`.

---

## 10. Quality bar before commit

**Hard rule — after *every* task that touches code, run lint and build
before considering the task done.** No exceptions, no "it's just a small
change." If either fails, the task is not done — fix it or report the
failure; do not claim success.

Run locally — all of these must pass:

```bash
npm run lint        # eslint            ← required after every code change
npm run build       # next build        ← required after every code change
npm run typecheck   # tsc --noEmit      (also run; build covers it but this is faster on partial work)
npm run format      # prettier --write
```

Then verify the change in the browser (light + dark, mobile + desktop)
before claiming the task is done. Type checks pass ≠ feature works, and
lint passing ≠ build passing — run both.

---

## 11. What "done" looks like

A change is done when:

1. It uses shadcn primitives where one exists.
2. It uses brand / semantic tokens — no hardcoded colors.
3. No file crossed the hard size cap; splits feel natural, not forced.
4. Server Component is the default; `"use client"` is scoped to the smallest
   island that needs it.
5. Inputs validated with zod; loading + error states exist; a11y checked.
6. **`npm run lint` and `npm run build` were both run and both passed** — this
   is mandatory after every code change, not optional.
7. The screen has been opened to confirm the change actually works.

If any of those is missing, it's not done — say so, don't claim success.

---

## 12. Shipping — which remote actually deploys

This repository exists in **three** places on GitHub. They are not
interchangeable, and pushing to the wrong one looks exactly like success.

| Remote       | GitHub repo                     | Deploys?                          |
|--------------|---------------------------------|-----------------------------------|
| `asera-hq`   | `asera-hq/acroma-web`           | **Yes — this is production**      |
| `origin`     | `Asera-Technologies/acroma-web` | No                                |
| `joelisking` | `Joelisking/acroma-web`         | No (builds to `acroma-web.vercel.app`) |

`acroma.asera.tech` is served by the `aseratechnology` Vercel project, which
builds from **`asera-hq/acroma-web`**. Push there, or the merchant never sees
the change. Push to all three to keep the copies in sync.

`asera-hq` is a private repo on a personal account, reachable over the
`github.com-asera-hq` SSH alias. Configured over HTTPS it answers 404, which
reads as "repo does not exist" when it actually means "you cannot see it".

### The commit-author trap

That Vercel account is on the Hobby plan, which **only deploys commits whose
author has contributing access**. A commit authored by anyone else is refused
with "Deployment Blocked", and a blocked deployment cannot be redeployed — the
fix is a fresh commit by an author Vercel accepts.

This silently froze production on July's code for two months. Both repos now
set `user.email` locally to the owning account's address; do not override it
per-commit, and check the deployment actually went green after pushing.
