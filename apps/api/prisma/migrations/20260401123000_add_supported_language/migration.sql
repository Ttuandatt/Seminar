-- CreateTable
CREATE TABLE "supported_languages" (
	"code" TEXT NOT NULL,
	"label" TEXT NOT NULL,
	"enabled" BOOLEAN NOT NULL DEFAULT true,
	"supportsText" BOOLEAN NOT NULL DEFAULT true,
	"supportsTts" BOOLEAN NOT NULL DEFAULT true,
	"requiresPack" BOOLEAN NOT NULL DEFAULT false,
	"allowOffline" BOOLEAN NOT NULL DEFAULT false,
	"defaultVoice" TEXT,
	"fallbackVoice" TEXT,
	"priority" INTEGER NOT NULL DEFAULT 100,
	"description" TEXT,
	"region" TEXT,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT "supported_languages_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE INDEX "supported_languages_priority_idx" ON "supported_languages"("priority");
