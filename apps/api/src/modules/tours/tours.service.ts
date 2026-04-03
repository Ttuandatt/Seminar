import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import {
    CreateTourDto,
    UpdateTourDto,
    SetTourPoisDto,
    QueryTourDto,
    TourStatusInput,
    CreateTourStopDto,
    UpdateTourStopDto,
    ReorderTourStopsDto,
} from './dto';
import { Prisma, TourStatus } from '@prisma/client';
import { SeedExportService } from '../seed-export/seed-export.service';

@Injectable()
export class ToursService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly seedExportService: SeedExportService,
    ) { }

    private toPrismaStatus(status?: TourStatusInput): TourStatus | undefined {
        if (!status) return undefined;
        if (status === 'PUBLISHED') return 'ACTIVE';
        if (status === 'ACTIVE' || status === 'DRAFT' || status === 'ARCHIVED') return status;
        throw new BadRequestException('Invalid tour status');
    }

    private toApiStatus(status: TourStatus) {
        return status === 'ACTIVE' ? 'PUBLISHED' : status;
    }

    private serializeTour<T extends { status: TourStatus }>(tour: T) {
        return {
            ...tour,
            status: this.toApiStatus(tour.status),
        };
    }

    private validatePoiIds(poiIds: string[]) {
        if (!poiIds.length) return;
        const uniqueCount = new Set(poiIds).size;
        if (uniqueCount !== poiIds.length) {
            throw new BadRequestException('Duplicate POI is not allowed in the same tour');
        }
    }

    private async ensurePoisValidForTour(poiIds: string[]) {
        if (!poiIds.length) return;
        const pois = await this.prisma.poi.findMany({
            where: {
                id: { in: poiIds },
                deletedAt: null,
                status: 'ACTIVE',
            },
            select: { id: true },
        });

        if (pois.length !== poiIds.length) {
            throw new BadRequestException('Some POIs are missing, deleted, or unpublished');
        }
    }

    private async assertCanPublish(tourId: string) {
        const tour = await this.prisma.tour.findFirst({
            where: { id: tourId, deletedAt: null },
            include: {
                tourPois: {
                    include: {
                        poi: {
                            select: {
                                id: true,
                                status: true,
                                deletedAt: true,
                            },
                        },
                    },
                    orderBy: { orderIndex: 'asc' },
                },
            },
        });

        if (!tour) throw new NotFoundException('Tour not found');
        if (!tour.nameVi?.trim()) {
            throw new BadRequestException('Tour title is required before publishing');
        }

        if (tour.tourPois.length < 2) {
            throw new BadRequestException('A published tour must contain at least 2 POIs');
        }

        const ids = tour.tourPois.map((item) => item.poiId);
        this.validatePoiIds(ids);

        const invalidStop = tour.tourPois.find((stop) => stop.poi.deletedAt || stop.poi.status !== 'ACTIVE');
        if (invalidStop) {
            throw new BadRequestException('Tour contains POIs that are deleted or unpublished');
        }

        const ordered = tour.tourPois.map((stop) => stop.orderIndex).sort((a, b) => a - b);
        const hasGap = ordered.some((value, index) => value !== index);
        if (hasGap) {
            throw new BadRequestException('Stop order must be continuous starting from 0');
        }
    }

    private async ensureTourExists(tourId: string) {
        const tour = await this.prisma.tour.findFirst({
            where: { id: tourId, deletedAt: null },
            select: { id: true, status: true },
        });
        if (!tour) throw new NotFoundException('Tour not found');
        return tour;
    }

    private async normalizeTourStopOrder(tourId: string) {
        const stops = await this.prisma.tourPoi.findMany({
            where: { tourId },
            orderBy: { orderIndex: 'asc' },
            select: { id: true, orderIndex: true },
        });

        await Promise.all(
            stops.map((stop, index) => {
                if (stop.orderIndex === index) return Promise.resolve();
                return this.prisma.tourPoi.update({
                    where: { id: stop.id },
                    data: { orderIndex: index },
                });
            }),
        );
    }

    async create(dto: CreateTourDto, userId: string) {
        const status = this.toPrismaStatus(dto.status) ?? 'DRAFT';
        const { status: _status, ...createData } = dto;
        if (status === 'ACTIVE') {
            throw new BadRequestException('Create tour as DRAFT first, then add stops and publish');
        }

        const tour = await this.prisma.tour.create({
            data: { ...createData, status, createdById: userId },
        });

        this.seedExportService.exportSeedData().catch(() => {});
        return this.serializeTour(tour);
    }

    async findAll(query: QueryTourDto) {
        const where: Prisma.TourWhereInput = { deletedAt: null };

        if (query.search) {
            where.OR = [
                { nameVi: { contains: query.search, mode: 'insensitive' } },
                { nameEn: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.status) where.status = this.toPrismaStatus(query.status);

        const [data, total] = await Promise.all([
            this.prisma.tour.findMany({
                where,
                skip: query.skip,
                take: query.limit,
                include: {
                    _count: { select: { tourPois: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.tour.count({ where }),
        ]);

        return {
            data: data.map((tour) => this.serializeTour(tour)),
            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / (query.limit ?? 10)),
            },
        };
    }

    async findOne(id: string) {
        const tour = await this.prisma.tour.findFirst({
            where: { id, deletedAt: null },
            include: {
                tourPois: {
                    include: {
                        poi: {
                            include: {
                                media: { where: { type: 'IMAGE' }, take: 1 },
                            },
                        },
                    },
                    orderBy: { orderIndex: 'asc' },
                },
            },
        });
        if (!tour) throw new NotFoundException('Tour not found');
        return this.serializeTour(tour);
    }

    async update(id: string, dto: UpdateTourDto) {
        await this.findOne(id);

        const mappedStatus = this.toPrismaStatus(dto.status);
        const { status: _status, ...updateData } = dto;
        if (mappedStatus === 'ACTIVE') {
            await this.assertCanPublish(id);
        }

        const tour = await this.prisma.tour.update({
            where: { id },
            data: {
                ...updateData,
                ...(mappedStatus ? { status: mappedStatus } : {}),
            },
        });
        this.seedExportService.exportSeedData().catch(() => {});
        return this.serializeTour(tour);
    }

    async setPois(tourId: string, dto: SetTourPoisDto) {
        const tour = await this.ensureTourExists(tourId);

        this.validatePoiIds(dto.poiIds);
        await this.ensurePoisValidForTour(dto.poiIds);

        if (tour.status === 'ACTIVE' && dto.poiIds.length < 2) {
            throw new BadRequestException('A published tour must contain at least 2 POIs');
        }

        // Delete existing, then insert in order
        await this.prisma.tourPoi.deleteMany({ where: { tourId } });

        const tourPois = dto.poiIds.map((poiId, index) => ({
            tourId,
            poiId,
            orderIndex: index,
        }));

        await this.prisma.tourPoi.createMany({ data: tourPois });

        this.seedExportService.exportSeedData().catch(() => {});

        return this.findOne(tourId);
    }

    async addStop(tourId: string, dto: CreateTourStopDto) {
        const tour = await this.ensureTourExists(tourId);

        const poi = await this.prisma.poi.findFirst({
            where: {
                id: dto.poiId,
                deletedAt: null,
                status: 'ACTIVE',
            },
            select: { id: true },
        });
        if (!poi) {
            throw new BadRequestException('POI is missing, deleted, or unpublished');
        }

        const duplicate = await this.prisma.tourPoi.findFirst({
            where: { tourId, poiId: dto.poiId },
            select: { id: true },
        });
        if (duplicate) {
            throw new BadRequestException('Duplicate POI is not allowed in the same tour');
        }

        const currentCount = await this.prisma.tourPoi.count({ where: { tourId } });
        const requestedIndex = dto.orderIndex ?? currentCount;
        const orderIndex = Math.max(0, Math.min(requestedIndex, currentCount));

        await this.prisma.$transaction([
            this.prisma.tourPoi.updateMany({
                where: { tourId, orderIndex: { gte: orderIndex } },
                data: { orderIndex: { increment: 1 } },
            }),
            this.prisma.tourPoi.create({
                data: {
                    tourId,
                    poiId: dto.poiId,
                    orderIndex,
                    titleOverride: dto.titleOverride,
                    descriptionOverride: dto.descriptionOverride,
                    customIntro: dto.customIntro,
                    estimatedStayMinutes: dto.estimatedStayMinutes,
                    transitionNote: dto.transitionNote,
                    isRequired: dto.isRequired ?? true,
                    unlockRule: dto.unlockRule,
                },
            }),
        ]);

        if (tour.status === 'ACTIVE') {
            await this.assertCanPublish(tourId);
        }

        this.seedExportService.exportSeedData().catch(() => {});
        return this.findOne(tourId);
    }

    async updateStop(tourId: string, stopId: string, dto: UpdateTourStopDto) {
        await this.ensureTourExists(tourId);
        const stop = await this.prisma.tourPoi.findFirst({
            where: { id: stopId, tourId },
            select: { id: true, orderIndex: true },
        });
        if (!stop) throw new NotFoundException('Tour stop not found');

        if (dto.orderIndex !== undefined && dto.orderIndex !== stop.orderIndex) {
            const count = await this.prisma.tourPoi.count({ where: { tourId } });
            const target = Math.max(0, Math.min(dto.orderIndex, count - 1));
            await this.prisma.tourPoi.update({
                where: { id: stopId },
                data: { orderIndex: target },
            });
            await this.normalizeTourStopOrder(tourId);
        }

        await this.prisma.tourPoi.update({
            where: { id: stopId },
            data: {
                titleOverride: dto.titleOverride,
                descriptionOverride: dto.descriptionOverride,
                customIntro: dto.customIntro,
                estimatedStayMinutes: dto.estimatedStayMinutes,
                transitionNote: dto.transitionNote,
                isRequired: dto.isRequired,
                unlockRule: dto.unlockRule,
            },
        });

        this.seedExportService.exportSeedData().catch(() => {});
        return this.findOne(tourId);
    }

    async removeStop(tourId: string, stopId: string) {
        await this.ensureTourExists(tourId);

        const stop = await this.prisma.tourPoi.findFirst({
            where: { id: stopId, tourId },
            select: { id: true },
        });
        if (!stop) throw new NotFoundException('Tour stop not found');

        await this.prisma.tourPoi.delete({ where: { id: stopId } });
        await this.normalizeTourStopOrder(tourId);

        this.seedExportService.exportSeedData().catch(() => {});
        return this.findOne(tourId);
    }

    async reorderStops(tourId: string, dto: ReorderTourStopsDto) {
        await this.ensureTourExists(tourId);

        const stops = await this.prisma.tourPoi.findMany({
            where: { tourId },
            select: { id: true },
        });
        const existingIds = new Set(stops.map((s) => s.id));

        if (dto.items.length !== stops.length) {
            throw new BadRequestException('Reorder payload must include all stops');
        }

        for (const item of dto.items) {
            if (!existingIds.has(item.id)) {
                throw new BadRequestException('Reorder payload contains invalid stop id');
            }
        }

        const orderValues = dto.items.map((item) => item.orderIndex).sort((a, b) => a - b);
        const invalidOrder = orderValues.some((value, index) => value !== index);
        if (invalidOrder) {
            throw new BadRequestException('orderIndex must be continuous and start from 0');
        }

        await this.prisma.$transaction(
            dto.items.map((item) =>
                this.prisma.tourPoi.update({
                    where: { id: item.id },
                    data: { orderIndex: item.orderIndex },
                }),
            ),
        );

        this.seedExportService.exportSeedData().catch(() => {});
        return this.findOne(tourId);
    }

    async remove(id: string) {
        await this.findOne(id);
        const tour = await this.prisma.tour.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        this.seedExportService.exportSeedData().catch(() => {});
        return this.serializeTour(tour);
    }

    async publish(id: string) {
        await this.assertCanPublish(id);
        const tour = await this.prisma.tour.update({
            where: { id },
            data: { status: 'ACTIVE' },
        });
        this.seedExportService.exportSeedData().catch(() => {});
        return this.serializeTour(tour);
    }

    async unpublish(id: string) {
        await this.findOne(id);
        const tour = await this.prisma.tour.update({
            where: { id },
            data: { status: 'DRAFT' },
        });
        this.seedExportService.exportSeedData().catch(() => {});
        return this.serializeTour(tour);
    }
}
