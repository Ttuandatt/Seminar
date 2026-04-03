-- Expand supported media languages for multilingual audio.
ALTER TYPE "MediaLanguage" ADD VALUE IF NOT EXISTS 'JA';
ALTER TYPE "MediaLanguage" ADD VALUE IF NOT EXISTS 'KO';
ALTER TYPE "MediaLanguage" ADD VALUE IF NOT EXISTS 'ZH_CN';
ALTER TYPE "MediaLanguage" ADD VALUE IF NOT EXISTS 'ZH_TW';
ALTER TYPE "MediaLanguage" ADD VALUE IF NOT EXISTS 'FR';
ALTER TYPE "MediaLanguage" ADD VALUE IF NOT EXISTS 'DE';
ALTER TYPE "MediaLanguage" ADD VALUE IF NOT EXISTS 'ES';
ALTER TYPE "MediaLanguage" ADD VALUE IF NOT EXISTS 'TH';
ALTER TYPE "MediaLanguage" ADD VALUE IF NOT EXISTS 'RU';

-- Store POI translations as JSON generated from Admin.
ALTER TABLE "pois"
ADD COLUMN IF NOT EXISTS "translations" JSONB DEFAULT '{}'::jsonb;
