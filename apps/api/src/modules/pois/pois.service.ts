import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { CreatePoiDto, UpdatePoiDto, QueryPoiDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PoisService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreatePoiDto, userId: string) {
        return this.prisma.poi.create({
            data: {
                ...dto,
                createdById: userId,
            },
            include: { media: true },
        });
    }

    async findAll(query: QueryPoiDto) {
        const where: Prisma.PoiWhereInput = {
            deletedAt: null,
        };

        if (query.search) {
            where.OR = [
                { nameVi: { contains: query.search, mode: 'insensitive' } },
                { nameEn: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.category) where.category = query.category;
        if (query.status) where.status = query.status;

        const [data, total] = await Promise.all([
            this.prisma.poi.findMany({
                where,
                skip: query.skip,
                take: query.limit,
                include: {
                    media: { where: { type: 'IMAGE' }, take: 1 },
                    owner: {
                        select: {
                            id: true,
                            fullName: true,
                            shopOwnerProfile: {
                                select: {
                                    shopName: true,
                                },
                            },
                        },
                    },
                    _count: { select: { tourPois: true, viewHistory: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.poi.count({ where }),
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
        const poi = await this.prisma.poi.findFirst({
            where: { id, deletedAt: null },
            include: {
                media: { orderBy: { orderIndex: 'asc' } },
                createdBy: { select: { id: true, fullName: true } },
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        shopOwnerProfile: {
                            select: {
                                shopName: true,
                            },
                        },
                    },
                },
            },
        });
        if (!poi) throw new NotFoundException('POI not found');
        return poi;
    }

    async update(id: string, dto: UpdatePoiDto) {
        await this.findOne(id);
        return this.prisma.poi.update({
            where: { id },
            data: dto,
            include: { media: true },
        });
    }

    async updateStatus(id: string, status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED') {
        await this.findOne(id);
        return this.prisma.poi.update({
            where: { id },
            data: { status },
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.poi.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
