# THRIFTX - Promotions & Referral Program Implementation

## Overview

This document covers the complete implementation of the THRIFTX welcome offer (50% off first orders) and referral program (₹100 Give/Get) features. All features are implemented with server-side validation and security-first approach.

## Architecture

### Core Principles
1. **Server-Side Only Calculations**: All discount calculations happen on server
2. **Zero Client Trust**: Client sends only identifiers, never amounts
3. **Atomic Operations**: Race condition prevention via intermediate states
4. **Idempotency**: Duplicate prevention via payment ID tracking
5. **Configurability**: All offer parameters editable by admin

### Technology Stack
- **Database**: Prisma ORM 7 with StoredDocument model
- **Validation**: Server-side in Next.js API routes
- **Payment**: Razorpay integration with notes audit trail
- **Admin Interface**: React components with real-time settings

## Implementation Guide

### 1. Welcome Offer (50% Off First Orders)

**Offer Details:**
- 50% discount on first order
- Applied to subtotal ≤ ₹299 maximum
- Automatically detected via `isFirstOrder()` check
- No cap on discount amount

**Server Flow:**
```
Checkout → getCheckoutPricing() → calculatePromotion()
         → Checks isFirstOrder(userId)
         → Returns discount as 50% of subtotal
         → Razorpay notes include discount amount
         → Order creation verifies discount matches quote
```

**Files Involved:**
- `lib/marketing/promotions.server.ts` - Welcome offer logic
- `lib/services/checkoutPricing.server.ts` - Integration point
- `app/api/payment/create-order/route.ts` - Razorpay order creation
- `app/api/orders/route.ts` - Order verification

### 2. Referral Program (₹100 Give/Get)

**Offer Details:**
- Referrer gets: ₹100 store credit
- Referred gets: ₹100 discount on first order
- Minimum order value: ₹499
- Per-customer limit: 5 successful referrals
- Reward issued 7 days after delivery

**Signup Flow:**
```
1. User clicks share link: /signup?ref=THRIFTX-XXXXX
2. signup/page.tsx captures query param
3. On successful signup, calls POST /api/marketing/referrals/record
4. Endpoint validates referral code and user eligibility
5. Records referral with status "first-order-placed"
```

**Order Completion Flow:**
```
1. Referred user places and completes order
2. Admin marks order status as "Delivered"
3. Admin calls POST /api/orders/[id]/referral-complete
4. Endpoint finds referral by orderId
5. Calls completeReferral() with atomic state machine
6. Issues ₹100 credit to referrer
7. Updates referral status to "reward-issued"
```

**Safety Mechanisms:**
1. **Self-Referral Prevention**: Code validation checks referrer ≠ referred
2. **Duplicate Prevention**: Deterministic doc ID prevents duplicate records
3. **Race Condition Fix**: Atomic "completing" state prevents concurrent credit issuance
4. **First-Order Validation**: Check on referred user account
5. **Idempotency**: completeReferral() idempotent via status checks

**Files Involved:**
- `lib/marketing/credits.ts` - Credit management
- `lib/marketing/promotions.server.ts` - Referral validation
- `lib/marketing/data.ts` - Referral data fetching
- `app/api/marketing/referrals/record/route.ts` - Record signup referral
- `app/api/orders/[id]/referral-complete/route.ts` - Issue referral reward
- `app/signup/page.tsx` - Capture referral code
- `app/refer/page.tsx` - Display referral info

### 3. Coupon & Best-Single-Offer Logic

**Coupon Flow:**
```
calculatePromotion() checks:
1. Is welcome offer applicable? (first order + subtotal ≤ 299)
2. Is referral discount applicable? (code valid + first order)
3. Is coupon code valid? (fetch all coupons, validate)
4. Which discount is highest?
5. Return BEST SINGLE OFFER (no stacking)
```

**Priority Logic:**
- Welcome offer: 50% of subtotal (max to ₹299 subtotal)
- Referral discount: 50% discount (if referred user's first order)
- Coupon discount: From coupon configuration
- **Best wins, others discarded**

## API Endpoints

### Customer Endpoints

#### GET /api/marketing/referrals
Returns user's referral code and referral history
```json
{
  "code": "THRIFTX-XXXXX",
  "referrals": [
    {
      "$id": "THRIFTX-XXXXX:referred-user-id",
      "referredEmail": "friend@example.com",
      "status": "completed",
      "completedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### GET /api/marketing/credits/wallet
Returns wallet balance and total earned
```json
{
  "balance": 500,
  "totalEarned": 1000
}
```

#### POST /api/marketing/credits/apply
Apply store credit to checkout (for future use)
```json
{
  "amount": 100,
  "addressId": "addr-123",
  "deliveryMethod": "standard"
}
```

#### POST /api/marketing/referrals/record
Record referral when user signs up with ref code
```json
{
  "referralCode": "THRIFTX-XXXXX",
  "referredEmail": "new@example.com"
}
```

### Admin Endpoints

#### GET /api/admin/promotion-settings
Fetch current promotion settings (admin only)

#### POST /api/admin/promotion-settings
Update promotion settings (admin only)
```json
{
  "welcomeOffer": {
    "enabled": true,
    "discountPercent": 50,
    "maxSubtotal": 299
  },
  "referralProgram": {
    "enabled": true,
    "rewardAmount": 100,
    "minOrderValue": 499,
    "perCustomerLimit": 5,
    "rewardDelayDays": 7
  }
}
```

#### POST /api/orders/[id]/referral-complete
Issue referral reward after order delivery (admin only)

## Components

### Customer-Facing

#### refer/page.tsx
Displays:
- User's unique referral code
- Copy-to-clipboard button
- Share link generator
- Wallet balance display
- Pending referrals (awaiting delivery)
- Completed referrals with ₹ earned

#### CreditUsage.tsx
- Shows available wallet balance
- "Apply Full Credit" button
- Custom amount input
- Remove credit option
- Validation and error messages

#### PromotionBanners.tsx
- Displays active promotion type
- Shows savings amount
- Green success styling

### Admin-Facing

#### PromotionSettingsModal.tsx
- Toggle welcome offer on/off
- Edit discount percentage
- Edit max subtotal
- Toggle referral program on/off
- Edit reward amount and rules
- Save changes with feedback

#### admin/promotions/page.tsx
- Admin settings page
- Includes PromotionSettingsModal

## Database Schema

### StoredDocument Collection: "referrals"
```
{
  "$id": "refcode:{userId}",
  "userId": "user-id",
  "code": "THRIFTX-XXXXX",
  "createdAt": "2024-01-01T00:00:00Z"
}

{
  "$id": "{referralCode}:{referred_userId}",
  "referrerUserId": "referrer-id",
  "referralCode": "THRIFTX-XXXXX",
  "referredEmail": "friend@example.com",
  "referredUserId": "friend-id",
  "orderId": "order-123",
  "status": "pending|first-order-placed|completed|reward-issued",
  "rewardAmount": 100,
  "completedAt": "2024-01-15T10:30:00Z"
}
```

### StoredDocument Collection: "credits"
```
{
  "$id": "credit-{timestamp}-{random}",
  "userId": "user-id",
  "amount": 100,
  "type": "referral|welcome|manual",
  "reason": "Referral reward",
  "orderId": "order-123",
  "expiresAt": null,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### StoredDocument Collection: "settings"
```
{
  "$id": "promotion-settings",
  "welcomeOffer": { ... },
  "referralProgram": { ... },
  "stackingRules": { ... }
}
```

## Security Considerations

### Implemented Safeguards
1. ✅ **Duplicate Order Prevention**: Idempotency check on paymentId
2. ✅ **Duplicate Credit Prevention**: Atomic "completing" state
3. ✅ **Self-Referral Block**: Referral code validation
4. ✅ **First-Order Validation**: Server-side check
5. ✅ **Payment Verification**: Discount matched against Razorpay notes
6. ✅ **Admin-Only Operations**: Role checks on sensitive endpoints
7. ✅ **Deterministic IDs**: Prevents duplicate referral records
8. ✅ **Discount Recalculation**: 3-checkpoint validation

### Not Yet Implemented
- [ ] Credit expiry enforcement
- [ ] Refund/cancellation handling
- [ ] Manual credit audit trail
- [ ] Rate limiting on sensitive endpoints
- [ ] Encryption of sensitive data at rest

## Testing Checklist

### New User (Welcome Offer)
- [ ] Navigate to /shop
- [ ] Add item to cart
- [ ] Go to checkout
- [ ] Verify promotion displays "Welcome: 50% off!"
- [ ] Complete order
- [ ] Verify 50% discount applied to final amount
- [ ] Check order contains discount in Razorpay notes
- [ ] Verify order created with discount amount (not 0)

### New User (With Referral Code)
- [ ] Get share link from existing user's /refer page
- [ ] Click link to /signup?ref=CODE
- [ ] Complete signup
- [ ] Verify referral recorded (check API)
- [ ] Place first order with referral
- [ ] Verify referral status updated to "first-order-placed"
- [ ] Admin marks order "Delivered"
- [ ] Admin calls POST /api/orders/[id]/referral-complete
- [ ] Verify referral status "reward-issued"
- [ ] Verify referrer's wallet increased by ₹100

### Existing User (No Welcome Offer)
- [ ] Login with existing account
- [ ] Add item to cart
- [ ] Verify welcome offer banner does NOT display
- [ ] Verify coupon discount still applies if eligible

### Coupon vs Welcome vs Referral
- [ ] Test welcome offer + coupon: best single offer wins
- [ ] Test welcome offer + referral: best single offer wins
- [ ] Verify no stacking occurs
- [ ] Check promotion banner shows which offer is applied

### Admin Settings
- [ ] Navigate to /admin/promotions
- [ ] Disable welcome offer
- [ ] Verify new users don't get 50% discount
- [ ] Re-enable and adjust to 40%
- [ ] Verify new users get 40% discount
- [ ] Disable referral program
- [ ] Verify referral codes rejected with error

## Known Limitations

1. **Credit Expiry**: Not currently enforced; credits persist indefinitely
2. **Refund Handling**: No automatic reversal of credit on cancellation
3. **Manual Reward Issuance**: Requires admin intervention (not automatic)
4. **Stacking Decision**: Fixed as "best single offer"; no user preference option
5. **Credit Usage**: Not yet integrated into checkout payment flow
6. **Scheduled Tasks**: No automatic reward delay enforcement (manual 7-day check)

## Next Steps

### Phase 7: Checkout Integration (Credit Deduction)
- [ ] Integrate CreditUsage into OrderSummary
- [ ] Update getCheckoutPricing to accept creditUsed parameter
- [ ] Validate credit amount at order creation
- [ ] Deduct credit from ledger atomically
- [ ] Handle partial credit application

### Phase 8: Automation
- [ ] Add scheduled job to auto-issue rewards after 7 days
- [ ] Add credit expiry job to mark expired credits
- [ ] Add email notifications for referral activity
- [ ] Add webhook for order status changes

### Phase 9: Analytics & Reporting
- [ ] Dashboard showing referral program metrics
- [ ] Credit issuance vs usage reports
- [ ] Welcome offer redemption rate tracking
- [ ] Customer acquisition cost analysis

### Phase 10: Enhancements
- [ ] Tier-based referral rewards (more rewards after N referrals)
- [ ] Seasonal promotions
- [ ] Referral leaderboard
- [ ] Email invitations from existing customers

## Support & Troubleshooting

### Issue: Duplicate referral credits issued
**Solution**: completeReferral() now uses atomic "completing" state. If it still occurs, check for concurrent calls.

### Issue: Welcome offer not applying
**Solution**: Verify `isFirstOrder(userId)` is working; check order subtotal ≤ 299.

### Issue: Referral code rejected with "Invalid code"
**Solution**: Verify referral code format is "THRIFTX-XXXXX"; check if code exists in DB.

### Issue: Admin referral-complete endpoint returns 404
**Solution**: Ensure referral document exists with matching orderId; order status must be "Delivered".

---

**Last Updated**: 2024-01-15
**Version**: 1.0
**Status**: Production Ready (Core Features)
