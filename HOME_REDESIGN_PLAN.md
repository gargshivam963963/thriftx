# THRIFTX Home Page — Complete Redesign Plan

## Overview
Complete mobile-first redesign using **shadcn/ui** components with a modern, clean, production-grade aesthetic. All sections will use fluid typography, consistent spacing, proper dark mode, and responsive grid layouts.

## Sections to Redesign

### 1. **Hero** (`components/home/Hero.tsx`)
**Current Issues:** Too much white, cluttered, inconsistent spacing, slow animations
**New Design:**
- Full-viewport hero with gradient background
- Left: Headline with animated gradient text effect
- Right: Product showcase with floating badges
- 3 trust badges below headline
- CTA buttons with shadcn Button component
- Responsive: Stack on mobile, side-by-side on desktop
- Add: "Free Same-Day Delivery in Panipat" banner with Zap icon

### 2. **Trust Strip** (`components/home/TrustStrip.tsx`)
**Current Issues:** Repetitive with WhyThriftX section
**New Design:**
- Minimal horizontal strip with 4 feature badges
- Each badge: Icon + label
- Compact, fits in one line on desktop, wraps on mobile
- Subtle border on hover

### 3. **Featured Categories** (`components/home/FeaturedCategories.tsx`)
**Current Issues:** Uses old CategoryCard with excessive shadow/radius
**New Design:**
- Grid of 4 category cards using shadcn Card
- Full-bleed image with overlay gradient
- Category name, product count, "Shop Now" link
- Hover: subtle scale + overlay darken
- Mobile: 1 column → 2 columns → 4 columns

### 4. **Best Products** (`components/home/BestProducts.tsx`)
**Current Issues:** Generic section header, inconsistent card
**New Design:**
- Section with "Trending Now" badge + "View All" link
- Product grid using existing ProductCard (already updated)
- Responsive: 2 cols mobile → 3 cols tablet → 4 cols desktop

### 5. **Brand Section** (`components/home/BrandSection.tsx`)
**Current Issues:** Old styling, inconsistent border radius
**New Design:**
- Clean grid of brand logos in rounded cards
- Hover: lift + shadow
- "Explore All Brands" CTA

### 6. **Why ThriftX** (`components/home/WhyThriftX.tsx`)
**Current Issues:** Too text-heavy, boring layout
**New Design:**
- Split layout: Left content + Right feature cards
- Feature cards with icons using shadcn Card
- Benefits checklist with checkmark icons

### 7. **Instagram Feed** (`components/home/InstagramFeed.tsx`)
**Current Issues:** Placeholder images, basic grid
**New Design:**
- 3-column grid (2 on mobile)
- Image hover overlay with Instagram icon
- "Follow Us" button

### 8. **Newsletter** (`components/home/Newsletter.tsx`)
**Current Issues:** Dark section with GlassCard, needs refinement
**New Design:**
- Clean CTA section with gradient background
- Email input (shadcn Input) + Subscribe button
- Clean, minimal

## Design Tokens Refinements
- Border radius: Use shadcn `--radius` (0.5rem) consistently
- Shadows: Use CSS variable shadows
- Spacing: Consistent padding using `py-16 md:py-24` pattern
- Typography: Use fluid scale classes (`.text-h1`, `.text-body`, etc.)

## Component Updates
All sections will:
- Use shadcn `Button` (already exists)
- Use shadcn `Card` for feature cards
- Use shadcn `Badge` for labels
- Use shadcn `Input` for forms
- Use `Container` for consistent width
- Use animation components (`FadeIn`, `FadeUp`, etc.)
- Be fully responsive (mobile-first)
- Support dark mode via CSS variables

