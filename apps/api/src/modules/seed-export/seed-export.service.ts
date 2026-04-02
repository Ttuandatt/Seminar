import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedExportService {
    private readonly logger = new Logger(SeedExportService.name);
    private readonly outputPath = path.join(process.cwd(), 'prisma', 'seeds', 'data.json');

    constructor(private prisma: PrismaService) { }

    /**
     * Export all seed-relevant data from DB to JSON.
     * Called fire-and-forget after CUD operations.
     */
    async exportSeedData(): Promise<void> {
        try {
            const [users, pois, tours] = await Promise.all([
                this.prisma.user.findMany({
                    include: {
                        shopOwnerProfile: true,
                        touristProfile: true,
                    },
                }),
                this.prisma.poi.findMany({
                    where: { deletedAt: null },
                    include: { media: true },
                }),
                this.prisma.tour.findMany({
                    where: { deletedAt: null },
                    include: {
                        tourPois: { orderBy: { orderIndex: 'asc' } },
                    },
                }),
            ]);

            // Strip auto-generated timestamps but keep IDs for relational linking
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

            // Ensure directory exists
            const dir = path.dirname(this.outputPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(this.outputPath, JSON.stringify(data, null, 2), 'utf-8');
            this.logger.log(`Seed data exported to ${this.outputPath} (${cleanUsers.length} users, ${cleanPois.length} POIs, ${cleanTours.length} tours)`);
        } catch (err) {
            this.logger.error(`Seed export failed: ${err.message}`);
        }
    }
}
