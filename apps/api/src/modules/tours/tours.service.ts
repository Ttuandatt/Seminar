import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { CreateTourDto, UpdateTourDto, SetTourPoisDto, QueryTourDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ToursService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateTourDto, userId: string) {
        return this.prisma.tour.create({
            data: { ...dto, createdById: userId },
        });
    }

    async findAll(query: QueryTourDto) {
        const where: Prisma.TourWhereInput = { deletedAt: null };

        if (query.search) {
            where.OR = [
                { nameVi: { contains: query.search, mode: 'insensitive' } },
                { nameEn: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.status) where.status = query.status;

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
            data,
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
        return tour;
    }

    async update(id: string, dto: UpdateTourDto) {
        await this.findOne(id);
        return this.prisma.tour.update({
            where: { id },
            data: dto,
        });
    }

    async setPois(tourId: string, dto: SetTourPoisDto) {
        await this.findOne(tourId);

        // Delete existing, then insert in order
        await this.prisma.tourPoi.deleteMany({ where: { tourId } });

        const tourPois = dto.poiIds.map((poiId, index) => ({
            tourId,
            poiId,
            orderIndex: index,
        }));

        await this.prisma.tourPoi.createMany({ data: tourPois });

        return this.findOne(tourId);
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.tour.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
