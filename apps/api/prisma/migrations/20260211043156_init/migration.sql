-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SHOP_OWNER', 'TOURIST');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'LOCKED');

-- CreateEnum
CREATE TYPE "PoiCategory" AS ENUM ('MAIN', 'SUB');

-- CreateEnum
CREATE TYPE "PoiStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TourStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'AUDIO');

-- CreateEnum
CREATE TYPE "MediaLanguage" AS ENUM ('VI', 'EN', 'ALL');

-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('GPS', 'QR', 'MANUAL');

-- CreateEnum
CREATE TYPE "UserAction" AS ENUM ('ACCEPTED', 'SKIPPED', 'DISMISSED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_owners" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "shopAddress" TEXT,
    "phone" TEXT,
    "avatarUrl" TEXT,

    CONSTRAINT "shop_owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tourist_users" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "languagePref" TEXT NOT NULL DEFAULT 'VI',
    "autoPlayAudio" BOOLEAN NOT NULL DEFAULT true,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pushToken" TEXT,
    "deviceId" TEXT,

    CONSTRAINT "tourist_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pois" (
    "id" TEXT NOT NULL,
    "nameVi" TEXT NOT NULL,
    "nameEn" TEXT,
    "descriptionVi" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "triggerRadius" INTEGER NOT NULL DEFAULT 15,
    "category" "PoiCategory" NOT NULL DEFAULT 'MAIN',
    "status" "PoiStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "ownerId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pois_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poi_media" (
    "id" TEXT NOT NULL,
    "poiId" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "language" "MediaLanguage" NOT NULL DEFAULT 'ALL',
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "originalName" TEXT,
    "sizeBytes" INTEGER,
    "durationSeconds" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poi_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tours" (
    "id" TEXT NOT NULL,
    "nameVi" TEXT NOT NULL,
    "nameEn" TEXT,
    "descriptionVi" TEXT,
    "descriptionEn" TEXT,
    "thumbnailUrl" TEXT,
    "estimatedDuration" INTEGER,
    "status" "TourStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_pois" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "poiId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "tour_pois_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "touristId" TEXT NOT NULL,
    "poiId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "view_history" (
    "id" TEXT NOT NULL,
    "touristId" TEXT NOT NULL,
    "poiId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "audioPlayed" BOOLEAN NOT NULL DEFAULT false,
    "triggerType" "TriggerType" NOT NULL DEFAULT 'MANUAL',

    CONSTRAINT "view_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trigger_logs" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "poiId" TEXT NOT NULL,
    "triggerType" "TriggerType" NOT NULL,
    "userAction" "UserAction" NOT NULL,
    "userLat" DOUBLE PRECISION,
    "userLng" DOUBLE PRECISION,
    "distanceMeters" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trigger_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "shop_owners_userId_key" ON "shop_owners"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "tourist_users_userId_key" ON "tourist_users"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "tour_pois_tourId_poiId_key" ON "tour_pois"("tourId", "poiId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_touristId_poiId_key" ON "favorites"("touristId", "poiId");

-- AddForeignKey
ALTER TABLE "shop_owners" ADD CONSTRAINT "shop_owners_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tourist_users" ADD CONSTRAINT "tourist_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pois" ADD CONSTRAINT "pois_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pois" ADD CONSTRAINT "pois_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poi_media" ADD CONSTRAINT "poi_media_poiId_fkey" FOREIGN KEY ("poiId") REFERENCES "pois"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tours" ADD CONSTRAINT "tours_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_pois" ADD CONSTRAINT "tour_pois_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_pois" ADD CONSTRAINT "tour_pois_poiId_fkey" FOREIGN KEY ("poiId") REFERENCES "pois"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "tourist_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_poiId_fkey" FOREIGN KEY ("poiId") REFERENCES "pois"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "view_history" ADD CONSTRAINT "view_history_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "tourist_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "view_history" ADD CONSTRAINT "view_history_poiId_fkey" FOREIGN KEY ("poiId") REFERENCES "pois"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trigger_logs" ADD CONSTRAINT "trigger_logs_poiId_fkey" FOREIGN KEY ("poiId") REFERENCES "pois"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
