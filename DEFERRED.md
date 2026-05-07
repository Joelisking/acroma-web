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

## ✅ 6. Web Push notifications

- New `webPushSubscription Json?` field on `Business`.
- New endpoints: `POST /business/me/web-push-subscription`,
  `DELETE /business/me/web-push-subscription`,
  `GET /business/vapid-public-key`.
- `notifications.service` fans out to **both** Expo (mobile) and Web
  Push (browser) for every notification type — new order, payment
  confirmed/failed, escalation. Each delivery is best-effort.
- Web: `public/sw.js` handles `push` + `notificationclick` (routes to
  the right page). `<NotificationsCard>` at
  `/dashboard/settings/notifications` walks the merchant through
  permission + subscription + unsubscribe.
- Backend env: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`.
  Generate with `npx web-push generate-vapid-keys`.

## Migration steps you still need to run

1. **Backend `.env`** already has the Cloudinary cloud name + upload
   preset and the rest of the existing config. To enable Web Push, add:
   ```
   VAPID_PUBLIC_KEY=
   VAPID_PRIVATE_KEY=
   VAPID_SUBJECT=mailto:you@asera.tech
   ```
   Generate with `npx web-push generate-vapid-keys`.
2. **Database migration:** the `webPushSubscription` field was added to
   the Prisma schema — run `npx prisma migrate dev --name web-push` in
   `acroma-backend` to create the migration locally, then apply with
   `npx prisma migrate deploy` in production.
3. **Service worker icons:** `public/sw.js` references `/icon-192.png`
   and `/badge.png` — drop those into `acroma-web/public/` (you can
   reuse the existing favicon for now).
