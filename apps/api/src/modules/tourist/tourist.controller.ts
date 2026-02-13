import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';
import { PrismaService } from '../../prisma';
import { PaginationDto } from '../../common/dto';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

class UpdateTouristDto {
    @IsOptional() @IsString() displayName?: string;
    @IsOptional() @IsString() languagePref?: string;
    @IsOptional() @IsBoolean() autoPlayAudio?: boolean;
    @IsOptional() @IsBoolean() pushEnabled?: boolean;
}

@Controller('tourist')
@UseGuards(JwtAuthGuard)
export class TouristController {
    constructor(private prisma: PrismaService) { }

    // ─── Profile ────────────────────────────
    @Get('me')
    async getProfile(@CurrentUser('id') userId: string) {
        return this.prisma.touristUser.findUnique({
            where: { userId },
            include: { user: { select: { email: true, fullName: true } } },
        });
    }

    @Patch('me')
    async updateProfile(
        @CurrentUser('id') userId: string,
        @Body() dto: UpdateTouristDto,
    ) {
        return this.prisma.touristUser.update({
            where: { userId },
            data: dto,
        });
    }

    // ─── Favorites ──────────────────────────
    @Get('me/favorites')
    async getFavorites(@CurrentUser('id') userId: string) {
        const tourist = await this.getTouristProfile(userId);
        return this.prisma.favorite.findMany({
            where: { touristId: tourist.id },
            include: {
                poi: {
                    include: { media: { where: { type: 'IMAGE' }, take: 1 } },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    @Post('me/favorites')
    async addFavorite(
        @CurrentUser('id') userId: string,
        @Body('poiId') poiId: string,
    ) {
        const tourist = await this.getTouristProfile(userId);

        const existing = await this.prisma.favorite.findUnique({
            where: { touristId_poiId: { touristId: tourist.id, poiId } },
        });
        if (existing) throw new ConflictException('Already in favorites');

        const fav = await this.prisma.favorite.create({
            data: { touristId: tourist.id, poiId },
        });
        return { id: fav.id, message: 'Added to favorites' };
    }

    @Delete('me/favorites/:poiId')
    async removeFavorite(
        @CurrentUser('id') userId: string,
        @Param('poiId') poiId: string,
    ) {
        const tourist = await this.getTouristProfile(userId);
        await this.prisma.favorite.delete({
            where: { touristId_poiId: { touristId: tourist.id, poiId } },
        });
        return;
    }

    // ─── History ────────────────────────────
    @Get('me/history')
    async getHistory(
        @CurrentUser('id') userId: string,
        @Query() query: PaginationDto,
    ) {
        const tourist = await this.getTouristProfile(userId);

        const [data, total] = await Promise.all([
            this.prisma.viewHistory.findMany({
                where: { touristId: tourist.id },
                include: {
                    poi: {
                        select: { id: true, nameVi: true, media: { where: { type: 'IMAGE' }, take: 1 } },
                    },
                },
                skip: query.skip,
                take: query.limit,
                orderBy: { viewedAt: 'desc' },
            }),
            this.prisma.viewHistory.count({ where: { touristId: tourist.id } }),
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

    @Post('me/history')
    async addHistory(
        @CurrentUser('id') userId: string,
        @Body() body: { poiId: string; triggerType?: string; audioPlayed?: boolean },
    ) {
        const tourist = await this.getTouristProfile(userId);
        return this.prisma.viewHistory.create({
            data: {
                touristId: tourist.id,
                poiId: body.poiId,
                triggerType: (body.triggerType as 'GPS' | 'QR' | 'MANUAL') || 'MANUAL',
                audioPlayed: body.audioPlayed || false,
            },
        });
    }

    private async getTouristProfile(userId: string) {
        const tourist = await this.prisma.touristUser.findUnique({
            where: { userId },
        });
        if (!tourist) throw new NotFoundException('Tourist profile not found');
        return tourist;
    }
}
