/*
  Warnings:

  - Added the required column `updatedAt` to the `shop_owners` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `tourist_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "shop_owners" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "tourist_users" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "favorites_touristId_idx" ON "favorites"("touristId");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE INDEX "poi_media_poiId_idx" ON "poi_media"("poiId");

-- CreateIndex
CREATE INDEX "pois_status_deletedAt_idx" ON "pois"("status", "deletedAt");

-- CreateIndex
CREATE INDEX "pois_ownerId_idx" ON "pois"("ownerId");

-- CreateIndex
CREATE INDEX "pois_createdById_idx" ON "pois"("createdById");

-- CreateIndex
CREATE INDEX "pois_category_idx" ON "pois"("category");

-- CreateIndex
CREATE INDEX "tour_pois_tourId_idx" ON "tour_pois"("tourId");

-- CreateIndex
CREATE INDEX "tours_status_deletedAt_idx" ON "tours"("status", "deletedAt");

-- CreateIndex
CREATE INDEX "tours_createdById_idx" ON "tours"("createdById");

-- CreateIndex
CREATE INDEX "trigger_logs_poiId_idx" ON "trigger_logs"("poiId");

-- CreateIndex
CREATE INDEX "trigger_logs_deviceId_idx" ON "trigger_logs"("deviceId");

-- CreateIndex
CREATE INDEX "trigger_logs_createdAt_idx" ON "trigger_logs"("createdAt");

-- CreateIndex
CREATE INDEX "view_history_touristId_idx" ON "view_history"("touristId");

-- CreateIndex
CREATE INDEX "view_history_poiId_idx" ON "view_history"("poiId");
