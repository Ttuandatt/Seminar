import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { CreatePoiDto, UpdatePoiDto, QueryPoiDto } from './dto';
import { Prisma, Role, MediaLanguage } from '@prisma/client';
import { TtsService } from '../tts/tts.service';

@Injectable()
export class PoisService {
    private readonly logger = new Logger(PoisService.name);

    constructor(
        private prisma: PrismaService,
        private ttsService: TtsService,
    ) { }

    async create(dto: CreatePoiDto, userId: string) {
        const poi = await this.prisma.poi.create({
            data: {
                ...dto,
                createdById: userId,
            },
            include: { media: true },
        });

        // Auto-generate TTS from description (fire-and-forget)
        this.autoGenerateTts(poi.id, dto.descriptionVi, dto.descriptionEn);

        return poi;
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
        const existing = await this.findOne(id);
        const poi = await this.prisma.poi.update({
            where: { id },
            data: dto,
            include: { media: true },
        });

        // Re-generate TTS if description changed
        const viChanged = dto.descriptionVi && dto.descriptionVi !== existing.descriptionVi;
        const enChanged = dto.descriptionEn && dto.descriptionEn !== existing.descriptionEn;
        if (viChanged || enChanged) {
            this.autoGenerateTts(
                id,
                viChanged ? dto.descriptionVi : undefined,
                enChanged ? dto.descriptionEn : undefined,
            );
        }

        return poi;
    }

    async updateStatus(id: string, status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED') {
        await this.findOne(id);
        return this.prisma.poi.update({
            where: { id },
            data: { status },
        });
    }

    async remove(id: string, currentUser: { id: string; role: Role }) {
        const poi = await this.findOne(id);
        const isAdmin = currentUser.role === Role.ADMIN;
        const ownsPoi = poi.ownerId === currentUser.id;

        if (!isAdmin && !ownsPoi) {
            throw new ForbiddenException('Only the owner or an admin can delete this POI.');
        }

        return this.prisma.poi.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    /**
     * Strip [Address: ...] prefix that admin panel prepends to descriptions.
     * TTS should only read the actual narration text, not metadata.
     */
    private cleanTextForTts(text: string): string {
        return text.replace(/^\[Address:.*?\]\s*/s, '').trim();
    }

    private autoGenerateTts(poiId: string, descriptionVi?: string, descriptionEn?: string | null) {
        const tasks: Promise<unknown>[] = [];

        if (descriptionVi) {
            const cleanText = this.cleanTextForTts(descriptionVi);
            if (cleanText.length < 10) {
                this.logger.warn(`TTS VI skipped for POI ${poiId}: cleaned text too short (${cleanText.length} chars)`);
            } else {
                tasks.push(
                    this.ttsService.generateForPoi(poiId, MediaLanguage.VI, cleanText)
                        .then(res => this.logger.log(`TTS VI generated for POI ${poiId}: ${res.url}`))
                        .catch(err => this.logger.error(`TTS VI failed for POI ${poiId}: ${err.message}`))
                );
            }
        }

        if (descriptionEn) {
            const cleanText = this.cleanTextForTts(descriptionEn);
            if (cleanText.length < 10) {
                this.logger.warn(`TTS EN skipped for POI ${poiId}: cleaned text too short (${cleanText.length} chars)`);
            } else {
                tasks.push(
                    this.ttsService.generateForPoi(poiId, MediaLanguage.EN, cleanText)
                        .then(res => this.logger.log(`TTS EN generated for POI ${poiId}: ${res.url}`))
                        .catch(err => this.logger.error(`TTS EN failed for POI ${poiId}: ${err.message}`))
                );
            }
        }

        // Fire and forget — don't block the response
        if (tasks.length > 0) {
            Promise.all(tasks).catch(() => {});
        }
    }
}
