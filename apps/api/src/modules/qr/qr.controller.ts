import { Controller, Get, Post, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { QrService } from './qr.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma';
import * as path from 'path';
import * as fs from 'fs';

@Controller('pois')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QrController {
    constructor(
        private qrService: QrService,
        private prisma: PrismaService,
    ) {}

    /**
     * GET /pois/:id/qr — get QR code info (URL + data URL for display)
     */
    @Get(':id/qr')
    @Roles(Role.ADMIN, Role.SHOP_OWNER)
    async getQr(@Param('id') id: string) {
        const poi = await this.prisma.poi.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, qrCodeUrl: true, nameVi: true },
        });
        if (!poi) {
            return { error: 'POI not found' };
        }

        // Generate if not exists
        let qrCodeUrl = poi.qrCodeUrl;
        if (!qrCodeUrl) {
            qrCodeUrl = await this.qrService.generateForPoi(id);
        }

        const dataUrl = await this.qrService.getQrDataUrl(id);

        return {
            poiId: id,
            poiName: poi.nameVi,
            qrCodeUrl,
            qrDataUrl: dataUrl,
            qrContent: `gpstours:poi:${id}`,
        };
    }

    /**
     * POST /pois/:id/qr/regenerate — force regenerate QR code
     */
    @Post(':id/qr/regenerate')
    @Roles(Role.ADMIN)
    async regenerateQr(@Param('id') id: string) {
        const qrCodeUrl = await this.qrService.generateForPoi(id);
        const dataUrl = await this.qrService.getQrDataUrl(id);
        return { poiId: id, qrCodeUrl, qrDataUrl: dataUrl };
    }

    /**
     * GET /pois/:id/qr/download — download QR code as PNG file
     */
    @Get(':id/qr/download')
    @Roles(Role.ADMIN, Role.SHOP_OWNER)
    async downloadQr(@Param('id') id: string, @Res() res: Response) {
        const poi = await this.prisma.poi.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, qrCodeUrl: true, nameVi: true },
        });
        if (!poi) {
            return res.status(404).json({ error: 'POI not found' });
        }

        // Generate if not exists
        if (!poi.qrCodeUrl) {
            await this.qrService.generateForPoi(id);
        }

        const filePath = path.resolve(process.cwd(), 'uploads', 'qr', `poi_${id}.png`);
        if (!fs.existsSync(filePath)) {
            await this.qrService.generateForPoi(id);
        }

        const safeName = poi.nameVi.replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF ]/g, '').trim().replace(/\s+/g, '_');
        res.download(filePath, `QR_${safeName}.png`);
    }
}
