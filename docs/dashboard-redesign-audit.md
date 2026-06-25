# Acroma Dashboard — UX Audit & Redesign Plan

> Audit date: 2026-06-25. Scope: full merchant dashboard (`acroma-web`), grounded in the
> live backend API (`acroma-backend`) and the existing brand system. This document is the
> source of truth for the redesign; it is updated as phases land.

---

## 0. Headline finding (read first)

The brief assumes a mock-laden, default-shadcn dashboard. **The actual codebase is not that.**
A recent "Warm Concierge" redesign already shipped (warm-on-white theme, Fraunces display,
slide-to-take-over, mobile bottom nav, real-time refresh). Concretely:

- **No mock/fake data found.** Every page fetches real data via Server Components + Server
  Actions through `apiFetch()`. `EMPTY_STATS`/`EMPTY_ACTIVITY` are error fallbacks, not fakes.
- **Mature brand tokens** already exist in `app/globals.css` (OKLCH orange/navy/blue/green,
  warm theme variant, `card-warm`, `needs-hero`, `composer-warm`, segmented control).
- **Mobile-first scaffolding exists**: `mobile-bottom-nav.tsx`, `theme-warm` shell, pull-to-refresh,
  PWA install tutorial, web push.
- **Real-time discipline is correct**: frontend listens to `business:<id>` room events and mutates
  via REST/Server Actions only.

**Implication:** this is an *elevation* job, not a from-scratch rebuild against fake data. The
high-value work is the operational UX (mobile/tablet ops board, action hierarchy, food rush-hour
speed, missing states, primitive extraction, large-form decomposition), not re-plumbing data or
re-deriving the brand.

---

## 1. Current routes

### Auth — `app/(auth)/*`
`login`, `register`, `forgot-password`, `reset-password` + `layout.tsx`.

### Dashboard — `app/dashboard/*`
- Home: `page.tsx`
- Conversations: `conversations/page.tsx`, `conversations/[id]/page.tsx`
- Orders: `orders/page.tsx`, `orders/[id]/page.tsx` (services → calendar view)
- Catalog: `catalog/page.tsx`, `catalog/new`, `catalog/[id]`, `catalog/[id]/edit`, `catalog/[id]/variants`
- Customers: `customers/page.tsx` (currently surfaced for services vertical)
- Discounts: `discounts/page.tsx`, `discounts/new`, `discounts/[id]`
- Broadcasts: `broadcasts/page.tsx`, `broadcasts/new`, `broadcasts/[id]`
- Settings: `settings/{business,whatsapp,whatsapp/guide,payments,ai,knowledge-base,opening-hours,notifications,reminders,security}`
- Shell: `dashboard/layout.tsx` (sidebar + top bar + main + mobile bottom nav + live refresh)

### Onboarding — `app/onboarding/*`
`step-1`…`step-7` + gate `layout.tsx`. (Maps to: business type → profile → hours → WhatsApp → payout → catalog → FAQ.)

### Customer-facing
`payment-complete/page.tsx`, `receipt/[token]/page.tsx`, root `page.tsx`.

---

## 2. Major UX problems (the real backlog)

| # | Problem | Where | Severity |
|---|---------|-------|----------|
| 1 | **Action hierarchy is flat.** Order status control branches across payment/fulfillment/vertical but doesn't make the *single next step* dominant. A paid food order should scream "Start preparing." | `orders/order-status-control.tsx` (279 lines) | High |
| 2 | **No ops-board mode.** Orders is a list/calendar, not a live, glanceable board for rush hour. No column/lane grouping by state, no big touch targets, no sticky action bar on mobile. | `orders/page.tsx` | High |
| 3 | **Escalation isn't impossible-to-miss.** Waiting-for-owner exists (orange badge) but doesn't dominate the home/nav the way the brief demands. | home, nav badges | High |
| 4 | **Giant forms.** 10+ forms exceed the size cap (`edit-product-form` 380, `payout-account-form` 295, `broadcast-composer` 285, `order-status-control` 279, `opening-hours-form` 218…). Hard to maintain, inconsistent internally. | `components/**` | Medium |
| 5 | **No shared primitives.** Page header, metric card, empty state, status badge, action bar are re-implemented inline per page → drift. | everywhere | Medium |
| 6 | **Broadcasts lacks a guided, safe flow.** Composer is one big component; no audience → message → preview → confirm steps; mass-send guardrails thin. | `broadcasts/broadcast-composer.tsx` | Medium |
| 7 | **Mobile = shrunk desktop in places.** Bottom nav exists, but list rows, detail pages, and forms aren't re-thought as card/sheet/sticky-bar layouts per breakpoint. | lists + detail pages | High |
| 8 | **Customers underused.** Page is thin and services-gated; high-value/recent/opted-out segmentation and order history not surfaced for all verticals. | `customers/page.tsx` | Medium |
| 9 | **Vertical leakage risk.** Stock vs sold-out vs appointments mostly handled, but controls aren't consistently gated by `tracksStock`/`usesAppointments`. | catalog, orders | Medium |
| 10 | **Visual register tension.** Current look is warm/editorial (Fraunces serif, grain, diagonal edges) — closer to *brand* than *tool*. The brief wants a calm "operating system." Needs a deliberate decision (see §6). | theme | Decision |

---

## 3. Hardcoded / mock data found

**None material.** Grep for `mock|fake|hardcoded|placeholder` across `app/` and `components/`
returned only legitimate input placeholders and validation constant arrays. All entities
(orders, conversations, customers, stats, broadcasts, discounts) are API-driven. The
"remove fake data" objective is largely already satisfied; the remaining work is ensuring new
UI keeps pulling real data and adds the few **missing endpoints** below rather than faking them.

---

## 4. API & data sources to use (real)

REST base via `lib/api/server.ts` (`apiFetch`, cookie auth, 401-refresh-retry). Key sources:

- Dashboard: `GET /dashboard/stats` (range + compare deltas), `GET /dashboard/activity`
- Orders: `GET /orders?status&from&to`, `GET /orders/:id`, `PATCH /orders/:id/status`,
  `PATCH /orders/mark-paid`, `POST /orders/:id/{regenerate-payment-link,sold-out-now,delay}`,
  `PATCH /orders/:id/delivery-address`
- Conversations: `GET /conversations?status`, `GET /conversations/unread-count` (`{count,waiting}`),
  `GET /conversations/:id`, `POST /conversations/:id/{reply,handoff,resolve}` (handoff: `TAKE_OVER|RESUME_AI`)
- Products: `GET/POST/PATCH/DELETE /products`, `POST /products/{parse,autofill}`,
  `POST|DELETE /products/:id/sold-out-today`, variants under `/products/:id/variants` + `/variants/:id`
- Customers: `GET /customers?search`, `GET /customers/export`, `PATCH /customers/:id`
- Discounts: `GET/POST/PATCH/DELETE /discounts`
- Broadcasts: `GET /broadcasts`, `GET /broadcasts/preview-count?bucket`, `POST /broadcasts`,
  `POST /broadcasts/:id/{send,cancel}`
- Payments: `GET /payments/payout-account`, `GET /payments/banks?type`, `POST /payments/resolve-account`,
  `POST|DELETE /payments/payout-account`
- Settings: `/settings/{whatsapp,payment-methods,order-options,orders-view,opening-hours,reminders,ai,booking-capacity,catalog-images}`
- FAQ: `/faq`, `/faq/onboarding`, `/faq/bulk`, `/faq/reset-to-template`
- Onboarding: `GET /onboarding/status`, `POST /onboarding/business-type`, `POST /onboarding/complete`
- Audit: `GET /audit?conversationId|orderId&cursor`

### Socket.IO (listen only, room `business:<id>`, JWT in handshake)
`order_updated` `{order}` · `new_message` `{conversationId,message}` · `conversation_updated` `{conversation}`.
(`broadcast_sent` is referenced in the client but not emitted by the gateway — see gaps.)

### Vertical helpers (mirror from backend, do not re-derive)
`tracksStock(type)` → false for `FOOD_BEVERAGES`, `SERVICES`; true otherwise.
`usesAppointments(type)` → true only for `SERVICES`.

### Missing endpoints (mark, don't fake)
1. **Payout/settlement history** — no `/payments/payouts`. Payments page can show payout *account*
   + per-order payment state, but not a settlement ledger. → Backend note.
2. **Broadcast recipient drilldown** — no `/broadcasts/:id/recipients`. Can show aggregate
   sent/delivered/read/failed only. → Backend note.
3. **`broadcast_sent` socket event** — client listens, gateway doesn't emit. Either emit it or
   drop the listener. → Backend note.
4. **Customers pagination/segments** — list returns all, no server segments (high-value/recent/
   opted-out). Derive client-side for now; note server-side segments as a follow-up.

---

## 5. Proposed information architecture

Primary nav (desktop sidebar / mobile bottom bar). Mobile bottom bar is capped at 5; the rest
live under "More".

**Mobile bottom bar (5):** Today · Orders · Chats · Catalog · More
**Desktop sidebar (full):** Today · Orders · Chats · Catalog · Customers · Broadcasts · Discounts · Payments · Settings

- Escalated chats and unpaid/actionable orders drive **badges** on Chats and Orders, and a
  persistent **attention strip** on Today.
- "Orders" and "Catalog" labels swap per vertical (Orders↔Bookings, Catalog↔Menu) via existing
  vocabulary layer — labels only, primitives stay neutral.

---

## 6. Open decision — visual register

The single decision that shapes everything downstream: **keep the warm/editorial identity, or
shift to a calmer "operating tool" register.** The brief asks for both "premium/warm/trustworthy"
*and* "calm operating system, minimal color, ops board not admin database." Those pull apart at
the seams (serif display + grain + diagonal edges read as marketing-warm, not tool-calm).
Resolved with the user before Phase 1 — see redesign thread.

---

## 7. Component system plan (shared primitives to extract)

Build these first (Phase 2), then refactor pages onto them:

- `PageHeader` — eyebrow + title + description + actions slot; consistent across every page.
- `MetricCard` / `AttentionCard` — stat with delta; non-equal visual weight (primary vs muted).
- `StatusBadge` — single source for `OrderStatus` / `ConversationStatus` color + label, vertical-aware.
- `EmptyState` — icon + title + one-line + single primary action (teaches the screen).
- `LoadingSkeleton` variants — list-row, card, detail, board-lane.
- `ActionBar` — sticky bottom bar (mobile/tablet) hosting the context-aware primary action.
- `ConfirmDialog` — wraps AlertDialog; reserved for destructive/irreversible only.
- `FilterBar` — status chips + date range, collapses to a sheet on mobile.
- `DetailPanel` — two-pane (list + detail) on desktop, push-route on mobile.
- `DataList` — responsive: table ≥ lg, scannable cards < lg (orders, conversations, broadcasts, customers).

## 8. Phase plan

1. Decision + design tokens pass (register resolved, tokens tuned for ops clarity).
2. Shared primitives (§7) + app shell/nav.
3. Dashboard home (attention-first).
4. Orders (ops board + context-aware primary action + mobile sticky bar). ← food flagship
5. Conversations (escalation-dominant, intentional take-over, context pane).
6. Catalog (vertical-aware: sold-out / stock / appointments).
7. Customers (segments for all verticals).
8. Broadcasts (guided audience→message→preview→confirm).
9. Discounts · 10. Payments · 11. Settings · 12. Onboarding.
13. Mobile/PWA polish · 14. States pass · 15. A11y pass · 16. Real-data verification.

Each phase ends green on `npm run lint && npm run build`.

---

## 9. Progress log

**Decisions (confirmed with owner):** elevate (not rebuild) · calmer "operating-tool"
register (keep brand colours, dial back Fraunces serif + grain) · Orders first · merchants
can pick their home surface.

**Fonts (actual):** Geist (UI/body), Geist Mono (mono), Fraunces (`.font-display`, now
reserved for low-pressure/brand moments, not ops surfaces).

### Done — verified `lint` + `build` green
- **Design tokens:** added `.card-calm` ops surface (left `card-warm` for warm surfaces).
- **Shared primitives:** `components/shared/page-header.tsx`, `components/shared/empty-state.tsx`.
- **Orders (flagship, deep):** operating board with lane grouping (`lib/orders/lanes.ts`),
  Live/All focus toggle, **one-tap inline primary action per card** (`order-card-action.tsx`),
  extracted shared action logic (`lib/orders/next-actions.ts` + `splitOrderActions`),
  calmer card register, dominant primary action on the detail control.
- **Conversations (deep):** escalation-dominant list — waiting threads sorted to top, warm
  highlight + "Waiting · Xm" pill, header count strip, `card-calm` list, calm `PageHeader`.
- **Today:** calmer greeting (serif dropped), home-surface redirect wired.
- **Landing preference:** cookie + referer-guarded redirect (`lib/home-preference.ts`,
  `lib/api/home-preference-actions.ts`, `home-preference-toggle.tsx`) — no backend change.
- **Consistency sweep:** Catalog, Customers, Broadcasts, Discounts, Settings shell moved onto
  `PageHeader` + `EmptyState`, serif/eyebrow headers replaced with the calm register.

### Remaining (next batches)
- Order **detail** + conversation **detail** register pass (still `card-warm`/serif/eyebrow).
- Catalog deeper: sold-out ergonomics, vertical-aware controls audit, the cross-link cards.
- Broadcasts **guided flow** (audience → message → preview → confirm) + mass-send guardrails.
- Payments page, Settings sub-forms (unsaved-change states), Onboarding 7-step redesign.
- Mobile/PWA sticky action bars, deep a11y pass, per-breakpoint testing in a real browser.
- `order-status-filter.tsx` now unused (replaced by board lanes) — remove or repurpose.

### Backend notes (mark, don't fake)
Payout/settlement list · broadcast recipient drilldown · `broadcast_sent` socket emit ·
server-side customer segments/pagination. See §4.
