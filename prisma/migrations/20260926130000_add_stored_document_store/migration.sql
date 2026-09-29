-- Add a lossless JSONB landing table for records being moved from Appwrite.
CREATE TABLE "StoredDocument" (
    "collectionKey" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StoredDocument_pkey" PRIMARY KEY ("collectionKey", "id")
);

CREATE INDEX "StoredDocument_collectionKey_createdAt_idx"
ON "StoredDocument"("collectionKey", "createdAt");