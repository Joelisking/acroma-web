# Internal Admin Usage Dashboard — Design

**Date:** 2026-07-09
**Status:** Approved, ready for implementation plan
**Scope:** Frontend only (`acroma-web`). No backend changes — reads the existing
`GET /admin/usage` endpoint shipped in the token-metering feature.

## Context

The backend exposes an internal token-cost report at `GET /admin/usage`
(guarded by an `x-admin-token` header; returns COGS aggregates). It is
Dysruptive-internal — NOT for merchants. Today the only way to read it is
`curl`. This adds a small internal web UI to view it.

The report shape (from the backend `UsageReport`):
`{ from, to, episodeCount, paidEpisodeCount, avgCostMicroUsdPerEpisode,
avgCostMicroUsdPerPaidEpisode, episodesPerPaidOrder, costByKind: Record<string,
number>, perBusiness: Array<{ businessId, episodes, costMicroUsd }>, note }`.
Costs are integer **micro-USD** (millionths of a USD).

## Key decisions

- **Separate admin auth, not merchant auth.** This is COGS across all
  merchants, so it must not be tied to any merchant login and merchants must
  never reach it. A standalone `/admin` area with its own password.
- **The admin API token never reaches the browser.** A server-side Route
  Handler holds `ADMIN_API_TOKEN` and proxies to the backend — same pattern as
  the existing `app/api/customers/export/route.ts`.

## Architecture

### Auth
- New server-side env: **`ADMIN_DASHBOARD_PASSWORD`** (gates the page) and
  **`ADMIN_API_TOKEN`** (backend header secret — set to the same value used on
  Render). Both server-only; never `NEXT_PUBLIC_`.
- **`lib/admin/auth.ts`** (`server-only`): 
  - `adminCookieValue()` → `HMAC-SHA256(key=ADMIN_DASHBOARD_PASSWORD,
    msg="acroma-admin-v1")` as hex (Node `crypto`). Deterministic, not
    guessable without the password, and never stores the raw password.
  - `isAdminAuthed()` → reads the `acroma_admin` cookie and compares (constant
    time via `crypto.timingSafeEqual`) to `adminCookieValue()`. Returns false
    if either the cookie or `ADMIN_DASHBOARD_PASSWORD` is absent (fail closed).
  - `ADMIN_COOKIE = "acroma_admin"`, TTL e.g. 12h.
- **`app/api/admin/login/route.ts`** (POST `{ password }`): if
  `password === ADMIN_DASHBOARD_PASSWORD` (constant-time compare; and password
  configured), set the httpOnly `acroma_admin` cookie to `adminCookieValue()`
  and return 200; else 401. httpOnly + `secure` (from `COOKIE_SECURE`) +
  sameSite lax + path `/`.
- **`app/api/admin/logout/route.ts`** (POST): delete the cookie.
- **Gating is done in server components** (matching the existing dashboard,
  which gates via `getCurrentBusiness()` + `redirect()` in its layout — there is
  no `middleware.ts`, so `proxy.ts` is NOT relied on). `app/admin/page.tsx`
  calls `isAdminAuthed()` and `redirect("/admin/login")` when false;
  `/admin/login` is ungated (and, if already authed, may redirect to `/admin`).
  Independent of merchant `acroma_access` — a merchant cookie grants nothing
  here. **`proxy.ts` is not modified.**
- **`app/admin/login/page.tsx`**: minimal password form → POSTs to the login
  route → on 200 routes to `/admin`; on 401 shows an inline error. Never
  renders any report data.

### Data
- **`app/api/admin/usage/route.ts`** (GET): reject with 401 unless
  `isAdminAuthed()`. Then `fetch(\`${ACROMA_API_URL}/admin/usage?from=&to=\`,
  { headers: { "x-admin-token": ADMIN_API_TOKEN }, cache: "no-store" })` and
  return the JSON (pass through `from`/`to` query params). 500 if
  `ACROMA_API_URL`/`ADMIN_API_TOKEN` unset. The token never leaves the server.

### Page
- **`app/admin/page.tsx`** (server component): if not `isAdminAuthed()`,
  redirect to `/admin/login` (defense in depth beside the proxy). Otherwise
  render `<UsageReport/>`.
- **`components/admin/usage-report.tsx`** (client): 
  - Date-range control: presets 7 / 30 / 90 days + custom from/to (default 30).
    Re-fetches `/api/admin/usage?from=&to=` on change.
  - Headline cards: **avg cost per paid conversation** (the pricing number),
    avg cost per episode, episodes-per-paid-order, total episodes, paid
    episodes.
  - Cost-by-kind list (REPLY / IMAGE / TRANSCRIPTION / ORDER_MESSAGE).
  - Per-business table (businessId, episodes, cost).
  - A logout button (POST `/api/admin/logout` → route to `/admin/login`).
  - Renders the backend `note` verbatim.
  - **USD formatting:** micro-USD → USD via `microUsdToUsd(n) = n / 1_000_000`,
    shown with enough precision for tiny values (e.g. `$0.008700`), and a
    larger aggregate shown as normal currency. One `lib/admin/format.ts` helper.
  - Built with the existing shadcn/ui primitives (Card, Table, Button, Input,
    Select) and brand tokens; functional and clean, not heavily art-directed.

## Error handling
- Wrong/absent admin password → login form error; never a partial data render.
- `/api/admin/usage` upstream non-200 → the client shows an error state, not a
  crash.
- Missing server env (`ADMIN_DASHBOARD_PASSWORD` / `ADMIN_API_TOKEN` /
  `ACROMA_API_URL`) → fail closed (login always 401 / usage route 500).

## Testing
`acroma-web` has **no unit-test runner** (matches repo practice — frontend is
verified by build + manual/preview). So:
- `npm run lint` + `npm run build` must pass.
- Preview verification: login rejects a wrong password (401 + inline error),
  accepts the right one (sets cookie, routes to `/admin`), the report renders
  with real numbers from the backend, date-range change re-fetches, logout
  clears the cookie and bounces to `/admin/login`, and hitting `/admin` while
  unauthed redirects to `/admin/login`.
- The HMAC/compare logic in `lib/admin/auth.ts` is kept tiny and pure so it can
  be reasoned about directly; no test file is added (no runner to run it).

## Env additions (documented, not committed with real values)
- `.env.example`: `ADMIN_DASHBOARD_PASSWORD=`, `ADMIN_API_TOKEN=`
  (`ACROMA_API_URL` already documented).

## Out of scope
- Any merchant-facing usage surface (that's sub-project B billing).
- Multiple admin users / roles (single shared password is sufficient now).
- Charts/graphs (numbers + tables only for v1; YAGNI).

## File list
- New: `lib/admin/auth.ts`, `lib/admin/format.ts`, `lib/admin/auth.test.ts`
- New: `app/api/admin/login/route.ts`, `app/api/admin/logout/route.ts`,
  `app/api/admin/usage/route.ts`
- New: `app/admin/login/page.tsx`, `app/admin/page.tsx`,
  `components/admin/usage-report.tsx`
- Modify: `proxy.ts` (add `/admin` gate), `.env.example`, `.gitignore`
  (`.claude/`)
