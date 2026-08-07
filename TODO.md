# Product Details Page — Production UI/UX Redesign

## ✅ BUTTON VARIANT FIX (Supporting cleanup)
- [x] Fix systemic default-`primary` variant leak → use `ghost`/`outline` where intended
- [x] ShareButton, WishlistButton, AddressCard, GlobalSearch, SortableImage, AnnouncementBar, Header, ConfirmDialog, ProductFormModal, ShopContent, admin customers

## 🎯 MAIN REDESIGN
- [ ] ProductGallery.tsx — full rewrite (fix nav/close/fullscreen bugs, blur-up, priority hero, lazy loading, swipe/drag/keyboard)
- [ ] ProductActions.tsx — fix Buy Now (cart+checkout), Add to Cart (optimistic + prevent duplicate), animated Wishlist
- [ ] StickyPurchaseBar.tsx — mobile sticky bottom purchase panel
- [ ] ProductDetailSkeleton.tsx — loading skeleton
- [ ] MeasurementsCard.tsx — measurement cards with icons
- [ ] app/product/[slug]/page.tsx — premium layout restructure
- [ ] Delivery estimate + trust badges + stock indicator
- [ ] SEO — structured schema, OpenGraph, Twitter cards, dynamic metadata
- [ ] Performance — cache product reads, memoize, lazy-load below-fold
- [ ] Final build + type check
