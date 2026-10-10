-- Add support conversations + messages, newsletter subscriptions, and analytics events.
-- Additive migration: safe to apply on top of 20250210000000_init,
-- 20260926120000_add_better_auth_schema, 20260926130000_add_stored_document_store,
-- or 20261003170000_add_checkout_inventory_reservations.
CREATE TABLE "NewsletterSubscription" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'subscribed',
    "consentVersion" TEXT NOT NULL DEFAULT '1.0',
    "consentTimestamp" TIMESTAMP(3),
    "source" TEXT,
    "landingPage" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "subscriptionId" TEXT,
    "unsubscribedAt" TIMESTAMP(3),
    "unsubscribedReason" TEXT,
    "createdCity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NewsletterSubscription_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "NewsletterSubscription_email_key" UNIQUE ("email")
);

CREATE INDEX "NewsletterSubscription_status_createdAt_idx" ON "NewsletterSubscription"("status", "createdAt");
CREATE INDEX "NewsletterSubscription_email_idx" ON "NewsletterSubscription"("email");

CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "orderId" TEXT,
    "properties" JSONB,
    "page" TEXT NOT NULL,
    "sessionId" TEXT,
    "referrer" TEXT,
    "userId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AnalyticsEvent_eventType_createdAt_idx" ON "AnalyticsEvent"("eventType", "createdAt");
CREATE INDEX "AnalyticsEvent_orderId_idx" ON "AnalyticsEvent"("orderId");
CREATE INDEX "AnalyticsEvent_userId_createdAt_idx" ON "AnalyticsEvent"("userId", "createdAt");
CREATE INDEX "AnalyticsEvent_sessionId_createdAt_idx" ON "AnalyticsEvent"("sessionId", "createdAt");

CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "guestToken" TEXT,
    "userId" TEXT,
    "orderRef" TEXT,
    "productSlug" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "source" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "answeredAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Conversation_guestToken_key" UNIQUE ("guestToken")
);

CREATE INDEX "Conversation_userId_createdAt_idx" ON "Conversation"("userId", "createdAt");
CREATE INDEX "Conversation_guestToken_idx" ON "Conversation"("guestToken");
CREATE INDEX "Conversation_status_createdAt_idx" ON "Conversation"("status", "createdAt");

CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "name" TEXT,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Message_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE
);

CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");
CREATE INDEX "Message_conversationId_senderType_idx" ON "Message"("conversationId", "senderType");
