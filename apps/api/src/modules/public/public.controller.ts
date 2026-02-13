import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { IsNumber, IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { TriggerType, UserAction } from '@prisma/client';

class NearbyQuery {
    @Type(() => Number) @IsNumber() lat: number;
    @Type(() => Number) @IsNumber() lng: number;
    @Type(() => Number) @IsOptional() @IsNumber() radius?: number;
}

class TriggerLogDto {
    @IsString() deviceId: string;
    @IsUUID() poiId: string;
    @IsEnum(TriggerType) triggerType: TriggerType;
    @IsEnum(UserAction) userAction: UserAction;
    @IsOptional() @Type(() => Number) @IsNumber() userLat?: number;
    @IsOptional() @Type(() => Number) @IsNumber() userLng?: number;
    @IsOptional() @Type(() => Number) @IsNumber() distanceMeters?: number;
}

class QrValidateDto {
    @IsString() qrData: string;
}

@Controller('public')
export class PublicController {
    constructor(private prisma: PrismaService) { }

    @Get('pois')
    async findAllPois() {
        return this.prisma.poi.findMany({
            where: { status: 'ACTIVE', deletedAt: null },
            include: {
                media: { where: { type: 'IMAGE' }, take: 1 },
            },
            orderBy: { nameVi: 'asc' },
        });
    }

    @Get('pois/nearby')
    async findNearby(@Query() query: NearbyQuery) {
        const radius = query.radius || 500; // meters
        // Simple distance filter using degree approximation
        // 1 degree ≈ 111km at equator, for Ho Chi Minh: ≈ 110km lat, ≈ 105km lng
        const latDelta = radius / 111000;
        const lngDelta = radius / (111000 * Math.cos((query.lat * Math.PI) / 180));

        const pois = await this.prisma.poi.findMany({
            where: {
                status: 'ACTIVE',
                deletedAt: null,
                latitude: { gte: query.lat - latDelta, lte: query.lat + latDelta },
                longitude: { gte: query.lng - lngDelta, lte: query.lng + lngDelta },
            },
            include: {
                media: { where: { type: 'IMAGE' }, take: 1 },
            },
        });

        // Calculate actual distance and sort
        return pois
            .map((poi) => ({
                ...poi,
                distance: this.haversine(query.lat, query.lng, poi.latitude, poi.longitude),
            }))
            .filter((poi) => poi.distance <= radius)
            .sort((a, b) => a.distance - b.distance);
    }

    @Get('pois/:id')
    async findOnePoi(@Param('id') id: string) {
        return this.prisma.poi.findFirst({
            where: { id, status: 'ACTIVE', deletedAt: null },
            include: {
                media: { orderBy: { orderIndex: 'asc' } },
            },
        });
    }

    @Get('tours')
    async findAllTours() {
        return this.prisma.tour.findMany({
            where: { status: 'ACTIVE', deletedAt: null },
            include: {
                _count: { select: { tourPois: true } },
            },
            orderBy: { nameVi: 'asc' },
        });
    }

    @Get('tours/:id')
    async findOneTour(@Param('id') id: string) {
        return this.prisma.tour.findFirst({
            where: { id, status: 'ACTIVE', deletedAt: null },
            include: {
                tourPois: {
                    include: {
                        poi: {
                            include: { media: { where: { type: 'IMAGE' }, take: 1 } },
                        },
                    },
                    orderBy: { orderIndex: 'asc' },
                },
            },
        });
    }

    @Post('trigger-log')
    async logTrigger(@Body() dto: TriggerLogDto) {
        const log = await this.prisma.triggerLog.create({ data: dto });
        return { id: log.id, recorded: true };
    }

    @Post('qr/validate')
    async validateQr(@Body() dto: QrValidateDto) {
        // QR data format: "gpstours:poi:<poiId>"
        const match = dto.qrData.match(/^gpstours:poi:(.+)$/);
        if (!match) return { valid: false, message: 'Invalid QR code' };

        const poi = await this.prisma.poi.findFirst({
            where: { id: match[1], status: 'ACTIVE', deletedAt: null },
            include: { media: { where: { type: 'IMAGE' }, take: 1 } },
        });

        if (!poi) return { valid: false, message: 'POI not found' };
        return { valid: true, poi };
    }

    private haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371000; // Earth radius in meters
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
