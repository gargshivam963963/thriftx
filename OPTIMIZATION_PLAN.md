# ThriftX — Mobile Conversion & COD Optimization Plan

## Problem Statement
Shivam's target audience is Instagram/WhatsApp based users in India who:
- Prefer **Cash on Delivery (COD)** over online payment
- Browse primarily on **mobile phones**
- Need **quick WhatsApp contact** for inquiries
- Are price-sensitive (₹350 items)

## Changes Required

### 1. ✅ COD (Cash on Delivery) Support

#### 1.1 Order Types
- Update `lib/types/order.ts` — Make `paymentId` and `signature` optional for COD orders
- Add `paymentMethod: "razorpay" | "cod"` field

#### 1.2 Order Service
- Update `lib/services/orderService.ts` — Allow COD orders to skip Razorpay payment fields

#### 1.3 Payment Section UI
- Update `components/checkout/payment/PaymentSection.tsx` — Add COD option card alongside Razorpay
- COD option shows "Pay when delivered — ₹0 upfront"
- ₹40 COD fee or free COD above ₹499

#### 1.4 Checkout Page Logic
- Update `app/checkout/page.tsx` — If COD selected, skip Razorpay checkout, create order directly
- Phone verification step for COD (OTP or just confirmation)

#### 1.5 Admin Orders
- COD orders should show "COD" badge in admin panel
- COD orders marked as "Pending Payment" instead of "Paid"

### 2. ✅ Mobile UI/UX Optimizations

#### 2.1 Trust Signals
- Add "✓ COD Available" badge on product cards
- Add "Free Delivery on orders above ₹499" banner on cart & checkout
- Show "7 Day Easy Returns" badge

#### 2.2 Mobile Checkout Flow
- Reduce number of steps visible on mobile (collapse by default)
- Add quick-select for saved addresses
- Pre-fill phone number from auth

#### 2.3 Sticky Bottom Bar Improvements
- Show savings/discount more prominently
- Add "COD" badge on mobile pay button
- Free delivery progress bar ("Add ₹150 more for free delivery")

### 3. ✅ WhatsApp Integration

#### 3.1 WhatsApp Order Button
- Add "Order via WhatsApp" as an alternative to full checkout
- Pre-filled message with cart details
- Visible on cart page and checkout

#### 3.2 WhatsApp Share
- Share product via WhatsApp button on product pages

#### 3.3 Contact Support
- WhatsApp floating button on checkout page for support

### 4. ✅ Performance Optimizations

#### 4.1 Lazy Loading
- Lazy load heavy components below the fold

#### 4.2 API Call Optimization
- Parallelize `getCartProducts()` + `getAddresses()` calls
- Add `loading` states properly

#### 4.3 Remove `selectedAddress` Duplication
- Derive selected address only in the checkout page, pass down as prop
- Remove duplicate logic from `CheckoutAccordion`

## Implementation Order
1. First: COD support (biggest conversion impact)
2. Second: WhatsApp integration (second biggest)
3. Third: Mobile UI improvements
4. Fourth: Performance cleanup

