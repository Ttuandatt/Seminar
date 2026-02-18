-- Add JSON profile data storage for flexible user fields
ALTER TABLE "users"
ADD COLUMN "profile" JSONB;

-- Persist structured shop opening hours
ALTER TABLE "shop_owners"
ADD COLUMN "openingHours" JSONB;
