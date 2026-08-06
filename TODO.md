# THRIFTX Enterprise Refactoring — Design System & Application Refactor

## Goal
Build a unified, fully-dynamic design system that the entire application follows. ONE font family, consistent tokens, reusable form primitives, central error handling, and no inline/arbitrary font sizes or radii. Refactor every page to use the design system.

## Phase 1: Design System Foundation ✅
- [x] **1. Consolidate to ONE font family** (Plus Jakarta Sans) — removed Playfair Display & DM Sans from layout
- [x] **2. globals.css** — complete design token system:
  - [x] Typography scale (Display XL → Price, Button, Badge, Label, Caption)
  - [x] Complete color system (semantic tokens)
  - [x] Radius system (enforced, no arbitrary values)
  - [x] Shadow system
  - [x] Spacing scale
  - [x] Animation/easing scale
  - [x] Icon scale
  - [x] Border scale
  - [x] Z-index system
  - [x] Container widths
- [x] **3. Typography utility classes** (`.text-display-xl`, `.text-heading-1`, etc.) fully dynamic via clamp()
- [x] **4. Reusable form primitives** (`@/components/ui/form/`):
  - [x] `FormField`, `Input`, `Select`, `Textarea`, `Checkbox`, `Radio`, `PasswordField`, `PhoneField`, `OtpField`, `ErrorMessage`, `HelperText`
- [x] **5. Update `app/layout.tsx`** — ONE font, remove unused font vars
- [x] **6. Verify** `tsc --noEmit` passes

## Phase 2: Centralized Error Handling ✅
- [x] **1. Create `lib/errors.ts`** — `normalizeError`, `getFriendlyError` mapping 401/403/404/409/422/429/500/offline/timeout/network
- [x] **2. Refactor `app/signup/page.tsx`** — RHF + Zod, form primitives, friendly errors, no `any`
- [x] **3. Refactor `app/login/page.tsx`** — RHF + Zod, form primitives, friendly errors, no `any`

## Phase 3: Apply Design System Across Pages (in progress)
- [ ] **1. Profile page** — design-system classes, shared skeleton, no raw buttons
- [ ] **2. Checkout page** — design-system classes, shared skeleton, no raw buttons
- [ ] **3. Shop page** — design-system classes, shared skeleton, no raw buttons
- [x] **4. Header/Footer** — design-system classes, no font-serif
- [x] **4b. BottomNav** — design-system classes
- [x] **5. Home page components** — design-system classes (Hero, TrustStrip, CategoryCard, FeaturedCategories, Newsletter, WhyThriftX, BrandSection, BestProducts)
  - [x] Replaced `font-serif` → `font-display` (single font family)
  - [x] Raw `text-[10px]`/`text-[11px]`/`text-[9px]` → `text-badge`/`text-caption`/`text-small`
  - [x] `text-xs`/`text-sm`/`text-xl`/`text-2xl`/`text-3xl` → semantic `text-body`/`text-small`/`text-heading-4`/`text-title`
  - [x] Hex colors → tokens (`text-muted-foreground`, `bg-card`, `border-border`, `shadow-card`)
  - [x] Header CartBadge `text-[10px]` → `text-badge`
  - [x] `tsc --noEmit` passes ✅
  - [x] ESLint passes ✅
- [x] **CRITICAL FIX: `@theme inline` semantic color mapping** in `globals.css` — maps shadcn CSS vars (`--foreground`, `--card`, `--muted`, `--muted-foreground`, etc.) into Tailwind v4 namespace so `text-foreground`, `text-muted-foreground`, `bg-card`, `bg-muted`, `border-border`, `text-background` utilities resolve correctly. This fixes login/signup + all refactored components.
- [x] **CRITICAL FIX 2: Status/descriptive color tokens** added to `@theme` (not covered by `@theme inline`) so `text-success`/`bg-success-bg`/`text-warning`/`bg-warning-bg`/`text-error`/`bg-error-bg`/`text-info`/`bg-info-bg`/`*-foreground` utilities generate correctly. Verified via successful `next build` (BUILD_ID generated).
- [x] **5b. Footer** — design-system classes (`text-body-sm`, `text-muted-foreground`, `text-foreground`, `bg-muted`, `border-border`, `text-background`, `bg-foreground`, `text-small`)
- [x] **6. Product page** — design-system classes (`text-display-lg`/`text-display-md` for price/title, `text-caption`, `text-body-sm`, `text-small`, `text-muted-foreground`, `text-foreground`, `bg-card`, `border-border`, `text-success`/`text-warning`/`text-info`, `bg-success-bg`/`bg-warning-bg`, `text-success-foreground`/`text-warning-foreground`)
- [x] **7a. Cart page + all cart components** — design-system classes (`text-caption`, `text-heading-2/3/4`, `text-body`/`text-body-sm`/`text-body-lg`, `text-small`, `text-badge`, `text-foreground`, `text-muted-foreground`, `bg-card`, `bg-muted`, `bg-foreground`, `text-background`, `border-border`, `text-success`/`text-warning`/`text-info`/`text-error`, `bg-success-bg`/`bg-warning-bg`/`bg-info-bg`/`bg-error-bg`, `text-success-foreground`/`text-warning-foreground`/`text-info-foreground`/`text-error-foreground`, `shadow-card`). CartItems consolidated to shared `EmptyState` (added `children` prop to EmptyState).
- [x] **7b. Orders/Wishlist** — design-system classes, shared empty states (EmptyState, status tokens `bg-warning-bg`/`text-warning-foreground`/`bg-info-bg`/`text-info-foreground`/`bg-success-bg`/`text-success-foreground`/`bg-error-bg`/`text-error-foreground`, `bg-muted`, `border-border`, `shadow-card`/`shadow-modal`, semantic typography)
- [x] **7c. Success page** — design-system classes (`text-heading-2`, `text-body-sm`/`text-body`, `text-caption`, `text-muted-foreground`, `bg-muted`, `border-border`, `bg-warning-bg`, `text-warning`/`text-warning-foreground`, `text-error`, `bg-card`, `shadow-card`, `shadow-foreground/20`, `from-success` gradient)
- [x] **7d. Refer page** — design-system classes (`text-heading-2`/`text-heading-4`, `text-body-sm`/`text-body`, `text-caption`/`text-small`/`text-badge`, `bg-foreground`/`text-background`, `bg-warning`/`text-warning-foreground`, `bg-success`/`text-success-foreground`, `bg-success-bg`/`bg-warning-bg`, `bg-muted`, `border-border`, `shadow-card`/`shadow-float`, `bg-background`), removed unused imports
- [x] **7e. Profile addresses page** — design-system classes (`bg-background`, `text-body-sm`, `text-muted-foreground`, `border-border`, `bg-card`, `bg-foreground`/`text-background`, `text-caption`, `text-heading-3`, `bg-muted`, `text-foreground`), removed unused imports
- [x] **7f. Profile orders page** — design-system classes (status tokens `bg-warning-bg`/`text-warning-foreground`/`bg-info-bg`/`text-info-foreground`/`bg-success-bg`/`text-success-foreground`/`bg-error-bg`/`text-error-foreground`/`bg-muted`/`text-muted-foreground`, `bg-background`, `text-heading-2/3/4`, `text-body`/`text-body-sm`, `text-small`/`text-badge`, `bg-card`, `bg-muted`, `border-border`, `shadow-card`, `bg-foreground`/`text-background`, `text-success`), removed unused imports

### Remaining pages to migrate (design tokens + dark/light + toasts + no `any`)
- [x] **8. app/profile/page.tsx** — StatsCard/MenuRow/ProfileSkeleton/main layout → tokens, remove unused imports (User, Phone, AlertCircle)
- [x] **9. app/orders/[id]/page.tsx** — STATUS_CONFIG → semantic tokens (warning/info/success/error), TrackingSkeleton/TrackingTimeline/DetailRow, removed `any` (added `TrackingStep` interface), all cards → `bg-card/border-border/shadow-card`
- [x] **10a. app/profile/settings** — migrated to tokens (bg-background/card, border-border, text-foreground/muted-foreground, shadow-card/modal, bg-muted, text-success, error tokens), removed unused imports (Mail, Globe, Moon, Loader2, Smartphone, X, Phone)
- [x] **10b. app/not-found** — migrated to tokens (bg-background, border-border, bg-card, shadow-card, text-caption, text-heading-3, text-foreground, text-body-sm, text-muted-foreground)
- [x] **10c. app/shop/ShopContent** — migrated to tokens (Semantic classes: text-body-sm/heading-3/heading-4/badge, text-foreground/muted-foreground, bg-card/muted, border-border, shadow-card, bg-foreground text-background for active/reset states), removed dead code (Breadcrumb imports, Select, CardContent/CardFooter, Home/Loader2 icons, pathname, activeFilterCount, searchTrackedRef, breadcrumbs build), removed console.logs from server page
- [x] **11. Shop filters** (BrandFilter, CategoryFilter, SizeFilter, PriceFilter, MeasurementFilter, SortDropdown, FilterDrawer) — migrated to tokens (`bg-foreground`/`text-background`, `text-badge`/`text-body-sm`/`text-small`, `text-muted-foreground`, `bg-card`/`bg-muted`, `border-border`, `shadow-card`/`shadow-float`, `bg-background`), zero remaining `neutral-*`/`text-[Npx]`
- [x] **12. Shop product grids** (ProductCardGrid, ProductCardList, ProductCardSkeleton) — migrated to tokens (`border-border`, `bg-card`, `bg-muted`, `text-badge`/`text-body`/`text-body-sm`/`text-small`/`text-heading-3`/`text-heading-4`, `text-foreground`/`text-muted-foreground`, `shadow-card`), zero remaining `neutral-*`/`text-[Npx]`
- [x] **13. Product page components** (SizeRecommendation, SimilarProductsSection, CompleteTheLookSection, RecentlyViewedSection) — migrated to tokens (Section card → `rounded-2xl border-border bg-card shadow-card`, eyebrow → `text-badge text-muted-foreground tracking-widest`, title → `text-heading-4 text-foreground`, detail → `text-body text-muted-foreground`, confidence → `bg-warning-bg text-warning-foreground`, chips → `bg-muted text-small text-muted-foreground`, link → `text-body-sm text-muted-foreground hover:text-foreground`), zero `neutral-*`/`text-[Npx]`
- [x] **14. Checkout components** (AddressCard, AddressList) + Marketing (CartOffers, WalletBalance) — migrated to tokens (AddressCard: `bg-card`/`border-border`/`border-foreground`/`ring-foreground`, `text-foreground`/`text-muted-foreground`/`text-success`/`text-success-foreground`, `bg-success-bg`, `bg-foreground`/`text-background`, `shadow-card`; AddressList: `bg-muted`/`border-border`/`border-foreground`, `bg-foreground`/`text-background`, `text-heading-4`/`text-body`/`text-small`/`text-body-sm`; CartOffers: `bg-success-bg`/`text-success-foreground`/`bg-success`, `bg-card`/`border-border`/`bg-foreground`/`text-background`; WalletBalance: `bg-muted`/`border-border`, `bg-foreground`/`text-background`, `text-heading-3`/`text-badge`), zero `neutral-*`/`text-[Npx]`
- [x] **15. Home shell remaining** (BestProducts, InstagramFeed, Hero residual, TrustStrip residual, BrandSection residual, WhyThriftX residual, FeaturedCategories residual, CategoryCard residual, CategorySkeleton, Newsletter residual, BottomNav) — migrated to tokens (`bg-card`/`bg-muted`/`border-border`/`border-foreground`, `shadow-card`/`shadow-float`, `text-foreground`/`text-muted-foreground`, `bg-foreground`/`text-background`, `bg-error`/`border-background`, `bg-card`/`bg-muted` skeletons); kept legit dark-brand-section gradients (Newsletter) & white-on-image overlays (CategoryCard/FeaturedCategories/Hero); zero raw `text-[#hex]`/`text-[Npx]`
- [x] **15b. Footer** — migrated to tokens (`bg-card`/`border-border`, `bg-muted`/`bg-foreground`/`text-background`, `text-foreground`, `text-muted-foreground`, `via-border`, `hover:border-foreground`/`hover:bg-foreground`/`hover:text-background`); kept brand logo gradient
- [x] **15c. app/layout** — removed dead hidden "CONNECTED" debug badge; verified `@theme inline` maps all semantic utilities (`text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `bg-background`, `text-success`, `bg-success-bg`, etc.) so all refactored pages use valid tokens
- [x] **16. Admin pages** — migrate all `neutral-*` → semantic tokens (`text-foreground`, `text-muted-foreground`, `bg-card`, `bg-muted`, `bg-muted-foreground`, `border-border`, `bg-background`, `text-background`, `bg-subtle`) via reusable token-migration scripts; `text-[9px]`/`text-[10px]` → `text-badge`; zero remaining `neutral-*`/`text-[Npx]` across app+components
- [x] **16b. UI primitives** — migrated `button.styles.ts` variants (primary/secondary/outline/ghost/glass/link) → tokens (`bg-foreground text-background`, `bg-muted text-foreground`, `border-border`, `hover:bg-muted`, `dark:bg-card`); `Card`, `dropdown-menu`, `Accordion`, `select` → tokens
- [x] **16c. `@theme inline` fix** — added `--color-subtle`/`--color-elevated` aliases so `bg-subtle`/`bg-elevated` utilities resolve (verifies `next build` succeeds)
- [ ] **17. Remove `any`** in lib/api files (7 files: shipping/shiprocket, categories, marketing/server, services/categories, services/adminService, api/marketing/referrals, api/analytics)
- [x] **18. Token migration verification** — `tsc --noEmit` passes (exit 0), `next build` succeeds (BUILD_ID generated), zero `neutral-*`/`text-[Npx]`/`text-[#hex]`/`border-[#hex]` in all tsx files (excluding legacy globals.css dark overrides)
- [x] **18b. Final full-app sweep** — zero `neutral-*` in ALL `.tsx`/`.ts` source files (0 matches); the only remaining `neutral-*` are the intentional legacy `.dark .text-neutral-*`/`.dark .bg-neutral-*` safety overrides in `globals.css`; all temporary migration scripts removed (`scripts/` now only has `bulk/`, `migrate-storage.ts`, `seedCategories.ts`)

## Phase 4: Consolidate Duplicates
- [ ] **1. Skeleton loaders** — one shared library (`components/ui/skeleton/`)
- [ ] **2. Empty states** — use `EmptyState` everywhere
- [ ] **3. Animations** — consolidate `lib/motion.ts` + `components/animations/`
- [ ] **4. ProductCard variants** — consolidate into one
- [ ] **5. Remove old `input.tsx`, `select.tsx`, `textarea.tsx`**

## Phase 5: Cleanup & Verification
- [ ] **1. Remove unused imports, files, dead code**
- [ ] **2. Zero TypeScript errors**
- [ ] **3. Zero ESLint errors**
- [ ] **4. Zero console errors**
- [ ] **5. Fully responsive, mobile-first**
- [ ] **6. Consistent design system everywhere**

## Notes
- All tokens live in `globals.css` `@theme` for Tailwind v4
- Fully dynamic: clamp() fluid scaling across all breakpoints (320px → 1440px+)
- No hardcoded `text-[10px]`, `text-[clamp(...)]`, `rounded-[28px]` etc. going forward
- `lib/errors.ts` centralizes all friendly error mapping
