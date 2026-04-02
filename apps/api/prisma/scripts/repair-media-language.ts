import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking poi_media.language for NULL values...');

    const nullCountRows = await prisma.$queryRaw<Array<{ count: bigint | number }>>`
        SELECT COUNT(*)::bigint AS count
        FROM "poi_media"
        WHERE "language" IS NULL
    `;

    const nullCount = Number(nullCountRows[0]?.count ?? 0);
    console.log(`Found ${nullCount} row(s) with language = NULL.`);

    if (nullCount > 0) {
        const updatedRows = await prisma.$executeRaw`
            UPDATE "poi_media"
            SET "language" = 'ALL'::"MediaLanguage"
            WHERE "language" IS NULL
        `;
        console.log(`Updated ${updatedRows} row(s) to ALL.`);
    }

    // Ensure future inserts cannot leave this field nullable.
    await prisma.$executeRawUnsafe(
        `ALTER TABLE "poi_media" ALTER COLUMN "language" SET DEFAULT 'ALL'::"MediaLanguage"`,
    );
    await prisma.$executeRawUnsafe(
        'ALTER TABLE "poi_media" ALTER COLUMN "language" SET NOT NULL',
    );

    const remainingRows = await prisma.$queryRaw<Array<{ count: bigint | number }>>`
        SELECT COUNT(*)::bigint AS count
        FROM "poi_media"
        WHERE "language" IS NULL
    `;

    const remaining = Number(remainingRows[0]?.count ?? 0);
    console.log(`Remaining NULL rows: ${remaining}.`);

    if (remaining !== 0) {
        throw new Error('Repair did not complete successfully.');
    }

    console.log('Done. Media language column is now valid and non-null.');
}

main()
    .catch((error) => {
        console.error('Repair failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
