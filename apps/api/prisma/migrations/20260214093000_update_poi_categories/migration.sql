-- Update PoiCategory enum to the new eight-category taxonomy
ALTER TYPE "PoiCategory" RENAME TO "PoiCategory_old";

CREATE TYPE "PoiCategory" AS ENUM (
    'DINING',
    'STREET_FOOD',
    'CAFES_DESSERTS',
    'BARS_NIGHTLIFE',
    'MARKETS_SPECIALTY',
    'CULTURAL_LANDMARKS',
    'EXPERIENCES_WORKSHOPS',
    'OUTDOOR_SCENIC'
);

ALTER TABLE "pois" ALTER COLUMN "category" DROP DEFAULT;

ALTER TABLE "pois" ALTER COLUMN "category" TYPE "PoiCategory" USING (
    CASE
        WHEN "category"::text = 'MAIN' THEN 'DINING'::"PoiCategory"
        WHEN "category"::text = 'SUB' THEN 'STREET_FOOD'::"PoiCategory"
        ELSE 'DINING'::"PoiCategory"
    END
);

ALTER TABLE "pois" ALTER COLUMN "category" SET DEFAULT 'DINING';

DROP TYPE "PoiCategory_old";
