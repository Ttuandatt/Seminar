import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const pois = await prisma.poi.findMany({
        include: {
            media: true
        }
    });

    const testPoi = pois.find(p => p.nameVi.includes('Test 4'));
    if (testPoi) {
        console.log(JSON.stringify(testPoi.media.filter(m => m.type === 'AUDIO'), null, 2));
    } else {
        console.log('POI Test 4 not found');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
