import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    ForbiddenException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { Role, MediaType, MediaLanguage } from '@prisma/client';
import { PrismaService } from '../../prisma';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { IsOptional, IsString } from 'class-validator';

const uploadDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

class UpdateShopOwnerDto {
    @IsOptional() @IsString() shopName?: string;
    @IsOptional() @IsString() phone?: string;
    @IsOptional() @IsString() shopAddress?: string;
}

@Controller('shop-owner')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SHOP_OWNER)
export class ShopOwnerController {
    constructor(private prisma: PrismaService) { }

    // ─── Profile ────────────────────────────
    @Get('me')
    async getProfile(@CurrentUser('id') userId: string) {
        return this.prisma.shopOwner.findUnique({
            where: { userId },
            include: { user: { select: { email: true, fullName: true } } },
        });
    }

    @Patch('me')
    async updateProfile(
        @CurrentUser('id') userId: string,
        @Body() dto: UpdateShopOwnerDto,
    ) {
        return this.prisma.shopOwner.update({
            where: { userId },
            data: dto,
        });
    }

    // ─── Own POIs ───────────────────────────
    @Get('pois')
    async getMyPois(@CurrentUser('id') userId: string) {
        return this.prisma.poi.findMany({
            where: { ownerId: userId, deletedAt: null },
            include: {
                media: { where: { type: 'IMAGE' }, take: 1 },
                _count: { select: { viewHistory: true, triggerLogs: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    @Post('pois')
    @UseInterceptors(
        FileInterceptor('audioVi', {
            storage: diskStorage({
                destination: uploadDir,
                filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname)}`),
            }),
        }),
    )
    async createPoi(
        @CurrentUser('id') userId: string,
        @Body() body: Record<string, string>,
        @UploadedFile() audioFile?: Express.Multer.File,
    ) {
        const poi = await this.prisma.poi.create({
            data: {
                nameVi: body.nameVi,
                nameEn: body.nameEn || null,
                descriptionVi: body.descriptionVi,
                descriptionEn: body.descriptionEn || null,
                latitude: parseFloat(body.latitude),
                longitude: parseFloat(body.longitude),
                createdById: userId,
                ownerId: userId,
            },
        });

        // Auto-create audio media if file uploaded
        if (audioFile) {
            await this.prisma.poiMedia.create({
                data: {
                    poiId: poi.id,
                    type: 'AUDIO',
                    language: 'VI',
                    url: `/uploads/${audioFile.filename}`,
                    originalName: audioFile.originalname,
                    sizeBytes: audioFile.size,
                },
            });
        }

        return { id: poi.id, ownerId: userId, message: 'POI created successfully' };
    }

    @Put('pois/:id')
    async updatePoi(
        @CurrentUser('id') userId: string,
        @Param('id') poiId: string,
        @Body() body: Record<string, string>,
    ) {
        const poi = await this.prisma.poi.findFirst({
            where: { id: poiId, deletedAt: null },
        });
        if (!poi) throw new NotFoundException('POI not found');
        if (poi.ownerId !== userId) throw new ForbiddenException('Not your POI');

        return this.prisma.poi.update({
            where: { id: poiId },
            data: {
                nameVi: body.nameVi,
                descriptionVi: body.descriptionVi,
                ...(body.nameEn ? { nameEn: body.nameEn } : {}),
            },
        });
    }

    @Post('pois/:id/media')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: uploadDir,
                filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname)}`),
            }),
        }),
    )
    async uploadMedia(
        @CurrentUser('id') userId: string,
        @Param('id') poiId: string,
        @UploadedFile() file: Express.Multer.File,
        @Body('type') type: MediaType,
        @Body('language') language?: MediaLanguage,
    ) {
        const poi = await this.prisma.poi.findFirst({
            where: { id: poiId, deletedAt: null },
        });
        if (!poi) throw new NotFoundException('POI not found');
        if (poi.ownerId !== userId) throw new ForbiddenException('Not your POI');
        if (!file) throw new BadRequestException('File is required');

        return this.prisma.poiMedia.create({
            data: {
                poiId,
                type: type || 'IMAGE',
                language: language || 'ALL',
                url: `/uploads/${file.filename}`,
                originalName: file.originalname,
                sizeBytes: file.size,
            },
        });
    }

    // ─── Analytics ──────────────────────────
    @Get('analytics')
    async getAnalytics(
        @CurrentUser('id') userId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const myPois = await this.prisma.poi.findMany({
            where: { ownerId: userId, deletedAt: null },
            select: { id: true, nameVi: true },
        });
        const poiIds = myPois.map((p) => p.id);

        const dateFilter: Record<string, Date> = {};
        if (startDate) dateFilter.gte = new Date(startDate);
        if (endDate) dateFilter.lte = new Date(endDate);

        const [totalViews, totalAudioPlays] = await Promise.all([
            this.prisma.viewHistory.count({
                where: { poiId: { in: poiIds }, ...(startDate ? { viewedAt: dateFilter } : {}) },
            }),
            this.prisma.viewHistory.count({
                where: {
                    poiId: { in: poiIds },
                    audioPlayed: true,
                    ...(startDate ? { viewedAt: dateFilter } : {}),
                },
            }),
        ]);

        // Per-POI stats
        const pois = await Promise.all(
            myPois.map(async (poi) => {
                const views = await this.prisma.viewHistory.count({
                    where: { poiId: poi.id, ...(startDate ? { viewedAt: dateFilter } : {}) },
                });
                const audio = await this.prisma.viewHistory.count({
                    where: {
                        poiId: poi.id,
                        audioPlayed: true,
                        ...(startDate ? { viewedAt: dateFilter } : {}),
                    },
                });
                return {
                    id: poi.id,
                    nameVi: poi.nameVi,
                    viewCount: views,
                    audioPlayCount: audio,
                    audioPlayRate: views > 0 ? Math.round((audio / views) * 100) / 100 : 0,
                };
            }),
        );

        return { totalViews, totalAudioPlays, pois };
    }
}
