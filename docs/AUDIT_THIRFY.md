# THRIFTX — Phase Zero Audit

Scope: Next.js 15 (App Router), Prisma 7.10 + PostgreSQL, better-auth, Razorpay,
Shiprocket, Resend, analytics (storedDocument), notifications (storedDocument),
admin dashboard, marketing (coupons/offers/announcements/sales).

Goal of this audit: establish a truthful baseline before any SEO, trust,
support, newsletter, or analytics changes are made.

## Repository facts

- Package name in `package.json` is `ai-studio-applet` (the app is a THRIFTX
  thrift-fashion storefront regardless of the package label).
- Framework: Next.js ^15.4.9 (App Router), React 19, TypeScript 5.9, Tailwind CSS 4.
- Database: PostgreSQL via Neon, accessed with `@prisma/adapter-pg` (the
  `PrismaPg` adapter). Prisma singleton lives in `lib/prisma.ts`.
- Source of truth for products/categories/brands: **Prisma tables**
  (`Product`, `ProductImage`, `Category`, `Brand`). The `NEXT_PUBLIC_APPWRITE_*`
  env vars are legacy references (only appear in `next.config.ts` image remote
  patterns and a user migration) and are NOT used for product reads.
- `lib/repositories/productRepository.ts` is the single product data-access
  layer, re-exported from `lib/repositories/index.ts`.
- `lib/seo.ts` holds the single `siteConfig` (name, url=https://thriftx.in,
  title, description, keywords, locale en_IN, country India, twitter @thriftx).
- `lib/contact.ts` holds the single source of truth for real contact channels:
  email, phone, whatsapp, instagram, facebook.
- Auth: better-auth + Prisma adapter. Email verification & password reset via
  Resend. Admin guard: `requireAdmin()` in `lib/auth-guard.ts` + `getAdminUser()`.
- Payments: Razorpay (client + server verification of captured payments).
- Delivery: Shiprocket (courier) + same-day Panipat local.
- Analytics: server-side API endpoints writing events to the `storedDocument`
  JSONB table (Appwrite-style document abstraction over the same Postgres).
- Notifications: server-side API writing to `storedDocument` as well.
- Admin: `app/admin/*` pages, guarded server-side by `app/admin/layout.tsx`.

## What is ALREADY working (do not break)

1. Product catalog read path (Prisma) with fallback categories when DB is empty.
2. Dynamic sitemap (`app/sitemap.ts`) built from Prisma `Product` rows for
   `/product/:slug`; plus static public pages and blog posts.
3. `robots.ts` disallows `/admin`, `/api`, `/cart`, `/checkout`, `/orders`,
   `/profile`, `/refer`, `/success` while allowing the storefront.
4. Metadata template `%s | THRIFTX`, canonical set to `siteConfig.url`, OG +
   Twitter cards on static pages and the homepage/layout.
5. Two JSON-LD blocks on the root layout: `Organization` and `WebSite`.
6. Existing storefront pages: shop (with search/filter), product detail, cart,
   checkout, orders, profile, login, signup, reset-password, success, about,
   contact, faqs, shipping, returns, privacy, terms, careers, blog.
7. Notifications API (`/api/notifications`) + admin marketing CRUD
   (`/api/admin/marketing`) for coupons, offers, announcements, sales.
8. Delivery estimates, same-day Panipat local + courier, product page trust

## Defects / gaps found (existing, pre-existing)

1. **No support/messaging data model**: no `Conversation` or `Message` tables.
   Website chat + protected admin support inbox cannot exist yet.
2. **No newsletter/subscription model** and no consent + unsubscribe flow.
3. **No dedicated analytics event table**; events are mixed into
   `storedDocument` (makes purchase-event verification fragile and couples
   analytics to transactional storage).
4. **Product page JSON-LD lacks a `Product`/`Offer` block** with real price,
   `availability`, `condition`, and `dateModified`; it only supplies
   Organization/WebSite at the layout level.
5. **No structured `BreadcrumbList`** on product/category pages.
6. **No canonical-URL helper** (duplication risk in per-page metadata).
7. **Contact/support channels are link-only**; there is no contact form,
   conversation persistence, or protected support inbox.
8. **No email-marketing subscription endpoint, consent record, or
   unsubscribe mechanism.**
9. **No analytics event for support conversations** or newsletter subscribe
   (only page_view/product_view/add_to_cart/checkout/purchase/search/wishlist).
10. **No real-time new-message channel**; `/api/notifications` exists but is
    not wired to support conversations, and there is no SSE/polling fallback.
11. `package.json` lint picks up 7 pre-existing `no-assign-module-variable`
    errors only inside `.next-dev` build artifacts. `tsc --noEmit` and
    `prisma generate` are clean on the unchanged repo.
12. `robots.txt` correctly blocks private routes but **should never be the only
    protection** — per-route auth guards already exist for that.

## Boundaries (untouched)

- Checkout, payment (Razorpay), inventory, order, shipping, pickup, tracking,
  authentication, and admin ordering flow are intentionally NOT modified.
- No fake reviews, orders, ratings, discounts, inventory, or SEO content is
  introduced.
- No AI chatbot / AI-generated support replies; support remains human-operated.

## What still needs external accounts / config

- Real `DATABASE_URL` to apply the new (manual) migration on a live instance.
- `BETTER_AUTH_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM` for email
  (auth sign-in/verification already need these; marketing email does too).
- WhatsApp Business API / Meta API credentials if a true WhatsApp Business
  Platform integration is later enabled (out of scope for this phase).
- AIS or social-ad console credentials for paid campaigns.
- `SPLIT`-style routing / real-user-monitoring for production debug.

## Proposed file set (high level)

- `prisma/schema.prisma` (add Conversation, Message, NewsletterSubscription,
  AnalyticsEvent) — DONE
- `prisma/migrations/20261003180000_support_newsletter_analytics/migration.sql`
  (additive) — DONE
- `lib/support/conversation.server.ts`, `lib/support/message.server.ts`
  + `app/api/contact/*` + `app/admin/support/*` — Phase D
- `lib/marketing/newsletter.server.ts` + `app/api/marketing/newsletter/*` — Phase E
- `lib/analytics/events.server.ts` + `app/api/analytics/events/*` — Phase F
- `app/product/[slug]/page.tsx` metadata + JSON-LD, `app/layout.tsx` metadata,
  `app/shop/[[...category]]/page.tsx` + `app/product/[slug]/page.tsx` breadcrumbs
  — Phase B
- `components/support/` chat launcher, `components/content/TrustStrip`/policy
  pages — Phase C

   messaging, payment-method display, order tracking page.

## Phase B — Technical SEO & Product Metadata (DONE, verified)

Implemented and verified with `tsc --noEmit`, `eslint`, and `npm run build`
(all passing):

- `lib/seo/metadata.ts`: new shared, escaped JSON-LD helpers
  (`escapeJsonLd`, `canonicalUrl`, `itemConditionFromStoreValue`,
  `productAvailability`, `serializeProductJsonLd`, `serializeBreadcrumbJsonLd`,
  `buildCategoryBreadcrumbs`). Import of `siteConfig` was missing (build
  would have failed) — fixed.
- `app/product/[slug]/page.tsx`:
  - `generateMetadata` now emits canonical URL (via helper), OG/Twitter cards,
    and truthfully `noindex`es sold/draft/inactive pieces so unavailable stock
    is never advertised. Fixed invalid `inLanguage`/`dateModified`/`og:dateModified`
    Metadata fields (moved locale into `openGraph.locale`).
  - Renders a real `Product` + `Offer` JSON-LD block with actual price, INR
    currency, real availability (InStock/OutOfStock from status+isActive), and
    schema.org item condition mapped from the store's condition text.
  - Renders a `BreadcrumbList` (Home > Shop > Gender > Category) built from real
    product category/gender, with the gender URL segment lower-cased to match
    the storefront route.
- `app/shop/[[...category]]/page.tsx`: renders a truthful `BreadcrumbList` whose
  labels resolve from the real `getGenders()`/`getCategories()` catalog (falls
  back to a humanized slug only when a name is not found).
- `app/layout.tsx`: fixed pre-existing invalid Metadata fields that blocked the
  build (`statusBarStyle: "dark"` → `"black-translucent"`, removed invalid
  `appleWebApp.icon`, removed non-existent `browserTheme`). Removed
  `maximumScale: 1` (an accessibility/zoom-blocking anti-pattern) and added the
  apple-touch icon via the correct `icons.apple` field. `metadataBase`,
  Organization, and WebSite JSON-LD already present and retained.
- `app/not-found.tsx`: added `noindex, follow` metadata + title.

Notes / still pending:
- The unused `components/breadcrumb/Breadcrumbs.tsx` has render bugs (double
  link/span) and is not imported anywhere; left in place untouched to avoid
  churn, recommend deletion in a cleanup pass.
- AggregateRating/Review JSON-LD intentionally NOT added (no genuine review
  data exists yet — must not be fabricated).

