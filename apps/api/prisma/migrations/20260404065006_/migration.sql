-- AlterTable
ALTER TABLE "pois" ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "tour_pois" ALTER COLUMN "updatedAt" DROP DEFAULT;
