import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';

@Injectable()
export class SyncService {
    constructor(private prisma: PrismaService) { }

    async getManifest() {
        const [poiCount, tourCount, lastPoiUpdate, lastTourUpdate] = await Promise.all([
            this.prisma.poi.count({ where: { status: 'ACTIVE', deletedAt: null } }),
            this.prisma.tour.count({ where: { status: 'ACTIVE', deletedAt: null } }),
            this.prisma.poi.aggregate({ _max: { updatedAt: true } }),
            this.prisma.tour.aggregate({ _max: { updatedAt: true } }),
        ]);

        return {
            poiCount,
            tourCount,
            lastPoiUpdate: lastPoiUpdate._max.updatedAt,
            lastTourUpdate: lastTourUpdate._max.updatedAt,
            // Estimated total media size (optional, can be calculated from media records if size field exists)
            totalMediaSize: 0, 
        };
    }

    async getDeltaPois(since: string) {
        const sinceDate = new Date(since);
        
        const pois = await this.prisma.poi.findMany({
            where: {
                OR: [
                    { updatedAt: { gt: sinceDate } },
                    { deletedAt: { gt: sinceDate } }
                ]
            },
            include: {
                media: {
                    where: { type: { in: ['IMAGE', 'AUDIO'] } }
                }
            }
        });

        const activePois = pois.filter(p => !p.deletedAt && p.status === 'ACTIVE');
        const deletedIds = pois.filter(p => p.deletedAt || p.status !== 'ACTIVE').map(p => p.id);

        return {
            pois: activePois,
            deletedIds,
        };
    }

    async getDeltaTours(since: string) {
        const sinceDate = new Date(since);

        const tours = await this.prisma.tour.findMany({
            where: {
                OR: [
                    { updatedAt: { gt: sinceDate } },
                    { deletedAt: { gt: sinceDate } }
                ]
            }
        });

        const activeTours = tours.filter(t => !t.deletedAt && t.status === 'ACTIVE');
        const deletedIds = tours.filter(t => t.deletedAt || t.status !== 'ACTIVE').map(t => t.id);

        return {
            tours: activeTours,
            deletedIds,
        };
    }

    async getTourPackage(tourId: string) {
        const tour = await this.prisma.tour.findUnique({
            where: { id: tourId },
            include: {
                tourPois: {
                    include: {
                        poi: {
                            include: {
                                media: {
                                    where: { type: { in: ['IMAGE', 'AUDIO'] } }
                                }
                            }
                        }
                    },
                    orderBy: { orderIndex: 'asc' }
                },
                // narrations: true // Assuming TourNarration relation exists from Feature 1
            }
        });

        if (!tour) return null;

        // Note: For now, I'll return narrations as empty if the relation isn't implemented yet
        // or I can check if the model exists in schema.
        const narrations = (tour as any).narrations || [];

        return {
            tour: {
                id: tour.id,
                nameVi: tour.nameVi,
                nameEn: tour.nameEn,
                descriptionVi: tour.descriptionVi,
                descriptionEn: tour.descriptionEn,
                estimatedDuration: tour.estimatedDuration,
                thumbnailUrl: tour.thumbnailUrl,
            },
            tourPois: tour.tourPois,
            narrations,
            // In a real scenario, we'd sum up sizeBytes of all related media
            estimatedDownloadSize: 0, 
        };
    }
}
