# Deferred features

Status as of the second migration pass. **#3 remains on hold per the
founder.** Everything else has shipped.

## ✅ 1. Variant editor

Full editor at `/dashboard/catalog/[id]/variants` with AI suggest,
dimension management, and a Cartesian-product variant grid for stock /
price-override / active per row.

## ✅ 2. AI product autofill / parse

`/dashboard/catalog/new` has a "Describe with AI" tab that uses
`POST /products/parse` to extract a full product (with variants) from a
plain-language description. The manual form has an "Auto-fill" button
next to the product name that calls `POST /products/autofill`.

## 3. WhatsApp Embedded Signup OAuth — **DEFERRED**

The mobile app uses Meta's Embedded Signup to provision WhatsApp
credentials in a single OAuth round-trip. The callback redirects to a
deep link (`quickshop://whatsapp-connected?success=...`).

Porting to web requires the backend to redirect to a web URL instead,
e.g. `${WEB_URL}/dashboard/settings/whatsapp?connected=success`. We'd
also probably want a separate `connect-url` variant whose `redirect_uri`
points at the web origin.

The founder asked to skip this: "I don't understand that one yet."
Manual credential entry (already shipped) covers the same ground.

## ✅ 4. Image upload — Cloudinary

- Web `<ImageUploader>` does direct browser → Cloudinary uploads using
  the **same unsigned upload preset the mobile app uses** (`quickshop_products`
  on cloud `dxfqrxjde`). The backend never touches files; the asset
  library is shared between mobile and web.
- Used in product form (`imageUrl`) and business profile (`logoUrl`).
- Web env (in `acroma-web/.env.local`):
  ```
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxfqrxjde
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=quickshop_products
  ```
- An earlier signed-upload backend module was removed in favour of the
  simpler unsigned approach. If we ever need signed uploads (per-business
  scoping, abuse prevention), reinstate `acroma-backend/src/uploads/`
  from git history.

## ✅ 5. AI toggle + business-context editing

- `UpdateBusinessDto` extended with `aiEnabled`,
  `businessDescription`, `aiBusinessContext`. Same fields surfaced in
  the `Business` select returned by `/business/me`.
- `/dashboard/settings/ai` is now a real form: toggle + description +
  AI-context textarea.

## ✅ 6. Notifications — Resend (email)

Originally scoped as Web Push, **swapped to email via Resend** because
push brought too much complexity (service worker, VAPID, browser
permission prompt, per-device subscriptions) for early-stage commerce
where merchants already check email constantly.

- New `emailNotificationsEnabled Boolean @default(true)` field on
  `Business`. Toggle exposed via `PATCH /business/me`.
- `notifications.service` fans out to **Expo push (mobile)** + **email
  (Resend)** for every notification type — new order, payment
  confirmed/failed, escalation. Each delivery is best-effort.
- Branded HTML + plain-text templates live in
  `src/notifications/email-templates.ts` (orange + navy, single CTA per
  email).
- Web: `/dashboard/settings/notifications` shows current email + a
  toggle to enable/disable.
- Backend env: `RESEND_API_KEY`, `RESEND_FROM` (default
  `Acroma <notifications@asera.tech>`), `WEB_URL` (used in CTA links).

If we ever want browser push back, the prior implementation lives in
git history — look for the commit that added `webPushSubscription`.

## Migration steps you still need to run

1. **Backend `.env`:** to enable email notifications, add:
   ```
   RESEND_API_KEY=re_…
   RESEND_FROM=Acroma <notifications@asera.tech>
   WEB_URL=https://app.asera.tech
   ```
   The `RESEND_FROM` domain (e.g. `asera.tech`) needs to be verified in
   Resend before prod sends work. Without `RESEND_API_KEY` the service
   logs a warning and silently no-ops — Expo push still works.
2. **Database migration:** the `emailNotificationsEnabled` field was
   added to the Prisma schema — run
   `npx prisma migrate dev --name email-notifications` in
   `acroma-backend` to create the migration locally, then apply with
   `npx prisma migrate deploy` in production.
