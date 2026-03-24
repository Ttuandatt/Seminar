import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const OUTPUT_PATH = path.join(__dirname, '..', 'seeds', 'data.json');

async function main() {
    console.log('📦 Exporting seed data from database...');

    const [users, pois, tours] = await Promise.all([
        prisma.user.findMany({
            include: {
                shopOwnerProfile: true,
                touristProfile: true,
            },
        }),
        prisma.poi.findMany({
            where: { deletedAt: null },
            include: { media: true },
        }),
        prisma.tour.findMany({
            where: { deletedAt: null },
            include: {
                tourPois: { orderBy: { orderIndex: 'asc' } },
            },
        }),
    ]);

    const cleanUsers = users.map(({ createdAt, updatedAt, ...rest }) => rest);
    const cleanPois = pois.map(({ createdAt, updatedAt, deletedAt, media, ...rest }) => ({
        ...rest,
        media: media.map(({ createdAt: _ca, ...m }) => m),
    }));
    const cleanTours = tours.map(({ createdAt, updatedAt, deletedAt, tourPois, ...rest }) => ({
        ...rest,
        tourPois: tourPois.map(({ id, ...tp }) => tp),
    }));

    const data = {
        exportedAt: new Date().toISOString(),
        users: cleanUsers,
        pois: cleanPois,
        tours: cleanTours,
    };

    const dir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Exported to ${OUTPUT_PATH}`);
    console.log(`   ${cleanUsers.length} users, ${cleanPois.length} POIs, ${cleanTours.length} tours`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
