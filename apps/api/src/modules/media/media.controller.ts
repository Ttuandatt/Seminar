import {
    Controller,
    Post,
    Delete,
    Param,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { Role, MediaType, MediaLanguage } from '@prisma/client';
import { PrismaService } from '../../prisma';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, unlinkSync } from 'fs';

const uploadDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

@Controller('pois/:poiId/media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class MediaController {
    constructor(private prisma: PrismaService) { }

    @Post()
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: uploadDir,
                filename: (_req, file, cb) => {
                    const name = `${randomUUID()}${extname(file.originalname)}`;
                    cb(null, name);
                },
            }),
            limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
        }),
    )
    async upload(
        @Param('poiId') poiId: string,
        @UploadedFile() file: Express.Multer.File,
        @Body('type') type: MediaType,
        @Body('language') language?: MediaLanguage,
    ) {
        if (!file) throw new BadRequestException('File is required');
        if (!type) throw new BadRequestException('type is required (IMAGE or AUDIO)');

        // Verify POI exists
        const poi = await this.prisma.poi.findFirst({
            where: { id: poiId, deletedAt: null },
        });
        if (!poi) throw new BadRequestException('POI not found');

        // Get next order index
        const lastMedia = await this.prisma.poiMedia.findFirst({
            where: { poiId },
            orderBy: { orderIndex: 'desc' },
        });

        const media = await this.prisma.poiMedia.create({
            data: {
                poiId,
                type,
                language: language || 'ALL',
                url: `/uploads/${file.filename}`,
                originalName: file.originalname,
                sizeBytes: file.size,
                orderIndex: (lastMedia?.orderIndex ?? -1) + 1,
            },
        });

        return media;
    }

    @Delete(':mediaId')
    async remove(
        @Param('poiId') poiId: string,
        @Param('mediaId') mediaId: string,
    ) {
        const media = await this.prisma.poiMedia.findFirst({
            where: { id: mediaId, poiId },
        });
        if (!media) throw new BadRequestException('Media not found');

        // Delete file
        const filePath = join(process.cwd(), media.url);
        if (existsSync(filePath)) unlinkSync(filePath);

        await this.prisma.poiMedia.delete({ where: { id: mediaId } });
        return { message: 'Media deleted' };
    }
}
