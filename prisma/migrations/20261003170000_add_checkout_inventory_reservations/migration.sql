ALTER TABLE "Product"
ADD COLUMN "reservedBy" TEXT,
ADD COLUMN "reservationId" TEXT,
ADD COLUMN "reservationExpiresAt" TIMESTAMP(3);

CREATE INDEX "Product_reservationExpiresAt_idx"
ON "Product"("reservationExpiresAt");
