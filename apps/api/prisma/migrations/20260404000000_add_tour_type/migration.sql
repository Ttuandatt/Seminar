-- CreateEnum
CREATE TYPE "TourType" AS ENUM ('OFFICIAL', 'CUSTOM');

-- AlterTable
ALTER TABLE "tours" ADD COLUMN "tourType" "TourType" NOT NULL DEFAULT 'OFFICIAL';

-- CreateIndex
CREATE INDEX "tours_tourType_createdById_deletedAt_idx" ON "tours"("tourType", "createdById", "deletedAt");
