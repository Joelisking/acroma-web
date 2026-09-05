# Acroma marketing landing page — design

**Date:** 2026-09-05
**Scope:** `acroma-web` only. No backend change, no API contract change.

## Problem

`app/page.tsx` is a placeholder that redirects to `/dashboard` or `/login`. Its
own comment says "Replace later with a real marketing landing page." Acroma has
no public front door: every link to the product lands a stranger on a login
form.

## Goal

A merchant-led landing page at `/` that explains what Acroma does, shows it
working, and sends business owners into `/register`. A compact market and
traction strip plus a footer contact line serve investors without taking the
page over.

## Decisions

| Question | Decision |
|----------|----------|
| Audience | Merchants first, investors served by a proof strip and a footer line |
| `/` when signed in | Serve the landing page; the nav CTA becomes "Go to dashboard" |
| Pricing | No monthly fee. 1% of payments collected through Acroma, plus AI usage billed at cost |
| 1% basis | Only payments Acroma collects (MoMo/Paystack). Cash and walk-in till orders are not charged |
| Aesthetic | Strictly in-brand: Geist + Geist Mono, existing brand tokens, no new palette, no new font |

## Concept

**The thread is the product.** Acroma lives inside a WhatsApp conversation, so
the hero is one: customer messages arrive, the AI replies, an order forms, a
payment link goes out, and a dashboard order card updates alongside it. A
visitor sees the product work before reading a claim about it.

Visual direction is a warm operator console. Navy `--brand-navy` is the
dominant ground for the hero, closing CTA and footer; warm `--paper` and white
carry the middle of the page; `--brand-orange` is the single sharp accent.
Geist runs at marketing scale (tight-tracked display type) and **Geist Mono
carries structure**: eyebrows, timestamps, order IDs, GHS amounts, step
numbers. The existing `.surface-grain` utility supplies texture.

Motion: one orchestrated staggered load, a hero thread that plays itself out on
an interval, and scroll-triggered reveals. Every animation is gated behind
`prefers-reduced-motion`, which resolves each element to its final state.

## Sections

1. **Nav** — logo, section anchors, auth-aware CTA. Sheet menu on mobile.
2. **Hero** — headline, subhead, two CTAs, animated thread and dashboard card.
3. **Problem** — "Every missed reply is a lost order", mono-numbered pain list.
4. **How it works** — five-step rail from customer message to owner dashboard.
5. **Features** — asymmetric bento covering the AI agent and the dashboard.
6. **Human in the loop** — one tap takes over the chat, the AI resumes after.
7. **Proof** — market and traction figures plus a merchant quote.
8. **Pricing** — one card: 1% plus AI usage at cost, with what is not charged.
9. **FAQ** — shadcn accordion.
10. **Closing CTA and footer** — orange band, footer carries the investor line.

## Copy rules

- Vertical-neutral per `CLAUDE.md`: catalog, items, orders, customers,
  merchant. Food appears only as one example among others.
- No em dashes in any customer-facing string.
- Currency shown as GHS.
- No claim the product does not already do.

## Structure

```
app/page.tsx                          server, metadata, composes sections (<80 lines)
components/marketing/
  content.ts                          all copy as typed data
  site-nav.tsx                        client: scroll state + mobile sheet
  hero.tsx                            server shell
  hero-thread.tsx                     client: the animated conversation
  problem-section.tsx
  how-it-works.tsx
  features-bento.tsx
  takeover-callout.tsx
  proof-strip.tsx
  pricing-section.tsx
  faq-section.tsx                     shadcn Accordion
  final-cta.tsx
  site-footer.tsx
  reveal.tsx                          client: shared IntersectionObserver reveal
  section-heading.tsx                 shared eyebrow + title
```

Supporting changes:

- `components/ui/accordion.tsx` added via shadcn.
- `components/ui/button.tsx` gains an `xl` size in its existing `cva` block.
  Marketing CTAs need a larger target than the app's `h-8` default. Extended in
  place, not forked.
- `app/globals.css` gains a clearly commented marketing-only utilities block
  built from existing tokens.

Every file stays inside the caps in `CLAUDE.md`. Server Components by default;
`"use client"` only on the nav, the hero thread, and the reveal wrapper.

## Non-goals

- No backend change, no new endpoint, no schema change.
- No blog, no docs site, no legal pages.
- No CMS. Copy lives in `content.ts` and ships with the code.
- No dark mode. Acroma is light-only.

## Done when

`npm run lint` and `npm run build` pass, and the page has been walked in a real
browser at desktop and mobile widths, signed out and signed in, with reduced
motion on and off.
