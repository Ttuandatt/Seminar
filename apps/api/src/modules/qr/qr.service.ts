import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class QrService {
    private readonly logger = new Logger(QrService.name);
    private readonly uploadDir: string;

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {
        this.uploadDir = path.resolve(process.cwd(), 'uploads', 'qr');
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    /**
     * Helper to generate a 2-hour token for the POI
     */
    private generateToken(poiId: string): string {
        const secret = this.configService.get<string>('JWT_SECRET') || 'defaultSecret';
        const payload = { poiId };
        return this.jwtService.sign(payload, { secret, expiresIn: '2h' });
    }

    /**
     * Generate a QR code PNG for a POI and save to disk.
     * QR data format: gpstours:poi:<poiId>:<TOKEN>
     */
    async generateForPoi(poiId: string): Promise<string> {
        const token = this.generateToken(poiId);
        const qrData = `gpstours:poi:${poiId}:${token}`;
        const fileName = `poi_${poiId}.png`;
        const filePath = path.join(this.uploadDir, fileName);
        const publicUrl = `/uploads/qr/${fileName}`;

        await QRCode.toFile(filePath, qrData, {
            type: 'png',
            width: 512,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
            errorCorrectionLevel: 'H',
        });

        // Update POI record with QR code URL
        await this.prisma.poi.update({
            where: { id: poiId },
            data: { qrCodeUrl: publicUrl },
        });

        this.logger.log(`QR code generated for POI ${poiId}: ${publicUrl}`);
        return publicUrl;
    }

    /**
     * Get QR code as base64 data URL (for inline display).
     */
    async getQrDataUrl(poiId: string): Promise<string> {
        const token = this.generateToken(poiId);
        const qrData = `gpstours:poi:${poiId}:${token}`;
        return QRCode.toDataURL(qrData, {
            width: 512,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
            errorCorrectionLevel: 'H',
        });
    }
}
