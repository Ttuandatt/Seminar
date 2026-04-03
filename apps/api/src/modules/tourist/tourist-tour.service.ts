import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { CreateTouristTourDto, UpdateTouristTourDto } from './dto/tourist-tour.dto';

@Injectable()
export class TouristTourService {
    constructor(private prisma: PrismaService) {}

    async createTour(userId: string, dto: CreateTouristTourDto) {
        // Validate all POIs exist and are active
        const pois = await this.prisma.poi.findMany({
            where: {
                id: { in: dto.poiIds },
                status: 'ACTIVE',
                deletedAt: null,
            },
            select: { id: true, latitude: true, longitude: true },
        });

        if (pois.length !== dto.poiIds.length) {
            throw new BadRequestException('One or more POIs are invalid or inactive');
        }

        // Order POIs as provided in the array
        const orderedPois = dto.poiIds.map(id => pois.find(p => p.id === id)!);
        const estimatedDuration = this.calculateDuration(orderedPois);

        return this.prisma.tour.create({
            data: {
                nameVi: dto.name,
                nameEn: null,
                descriptionVi: dto.description || null,
                descriptionEn: null,
                estimatedDuration,
                status: 'ACTIVE',
                tourType: 'CUSTOM',
                createdById: userId,
                tourPois: {
                    create: dto.poiIds.map((poiId, index) => ({
                        poiId,
                        orderIndex: index,
                    })),
                },
            },
            include: {
                tourPois: {
                    include: { poi: { include: { media: { where: { type: 'IMAGE' }, take: 1 } } } },
                    orderBy: { orderIndex: 'asc' },
                },
                _count: { select: { tourPois: true } },
            },
        });
    }

    async findAll(userId: string) {
        return this.prisma.tour.findMany({
            where: {
                tourType: 'CUSTOM',
                createdById: userId,
                deletedAt: null,
            },
            include: {
                _count: { select: { tourPois: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(userId: string, tourId: string) {
        const tour = await this.prisma.tour.findFirst({
            where: {
                id: tourId,
                tourType: 'CUSTOM',
                createdById: userId,
                deletedAt: null,
            },
            include: {
                tourPois: {
                    include: {
                        poi: {
                            include: { media: true },
                        },
                    },
                    orderBy: { orderIndex: 'asc' },
                },
            },
        });

        if (!tour) throw new NotFoundException('Tour not found');
        return tour;
    }

    async update(userId: string, tourId: string, dto: UpdateTouristTourDto) {
        const tour = await this.prisma.tour.findFirst({
            where: {
                id: tourId,
                tourType: 'CUSTOM',
                createdById: userId,
                deletedAt: null,
            },
        });

        if (!tour) throw new NotFoundException('Tour not found');

        // Build update data
        const updateData: any = {};
        if (dto.name !== undefined) updateData.nameVi = dto.name;
        if (dto.description !== undefined) updateData.descriptionVi = dto.description;

        // If poiIds provided, validate and replace stops
        if (dto.poiIds) {
            const pois = await this.prisma.poi.findMany({
                where: {
                    id: { in: dto.poiIds },
                    status: 'ACTIVE',
                    deletedAt: null,
                },
                select: { id: true, latitude: true, longitude: true },
            });

            if (pois.length !== dto.poiIds.length) {
                throw new BadRequestException('One or more POIs are invalid or inactive');
            }

            const orderedPois = dto.poiIds.map(id => pois.find(p => p.id === id)!);
            updateData.estimatedDuration = this.calculateDuration(orderedPois);

            // Delete existing stops and create new ones in a transaction
            return this.prisma.$transaction(async (tx) => {
                await tx.tourPoi.deleteMany({ where: { tourId } });
                return tx.tour.update({
                    where: { id: tourId },
                    data: {
                        ...updateData,
                        tourPois: {
                            create: dto.poiIds!.map((poiId, index) => ({
                                poiId,
                                orderIndex: index,
                            })),
                        },
                    },
                    include: {
                        tourPois: {
                            include: { poi: { include: { media: { where: { type: 'IMAGE' }, take: 1 } } } },
                            orderBy: { orderIndex: 'asc' },
                        },
                        _count: { select: { tourPois: true } },
                    },
                });
            });
        }

        return this.prisma.tour.update({
            where: { id: tourId },
            data: updateData,
            include: {
                tourPois: {
                    include: { poi: { include: { media: { where: { type: 'IMAGE' }, take: 1 } } } },
                    orderBy: { orderIndex: 'asc' },
                },
                _count: { select: { tourPois: true } },
            },
        });
    }

    async remove(userId: string, tourId: string) {
        const tour = await this.prisma.tour.findFirst({
            where: {
                id: tourId,
                tourType: 'CUSTOM',
                createdById: userId,
                deletedAt: null,
            },
        });

        if (!tour) throw new NotFoundException('Tour not found');

        return this.prisma.tour.update({
            where: { id: tourId },
            data: { deletedAt: new Date() },
        });
    }

    /**
     * Calculate estimated duration: haversine distances / 75m per min + 10min per stop
     */
    private calculateDuration(pois: { latitude: number; longitude: number }[]): number {
        let totalDistance = 0;
        for (let i = 0; i < pois.length - 1; i++) {
            totalDistance += this.haversine(
                pois[i].latitude, pois[i].longitude,
                pois[i + 1].latitude, pois[i + 1].longitude,
            );
        }
        const walkingMinutes = totalDistance / 75; // 75m per minute
        const stopMinutes = pois.length * 10;
        return Math.round(walkingMinutes + stopMinutes);
    }

    private haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371000;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
