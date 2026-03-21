import {
    Injectable,
    BadRequestException,
    NotFoundException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { MediaLanguage } from '@prisma/client';
import { join } from 'path';
import { existsSync, mkdirSync, statSync, unlinkSync } from 'fs';
import { randomUUID } from 'crypto';

const VOICE_MAP: Record<string, { default: string; alternatives: string[] }> = {
    VI: {
        default: 'vi-VN-HoaiMyNeural',
        alternatives: ['vi-VN-NamMinhNeural'],
    },
    EN: {
        default: 'en-US-AriaNeural',
        alternatives: ['en-US-GuyNeural', 'en-US-JennyNeural'],
    },
};

const UPLOADS_DIR = join(process.cwd(), 'uploads', 'tts');

@Injectable()
export class TtsService {
    private readonly logger = new Logger(TtsService.name);

    constructor(private prisma: PrismaService) {
        if (!existsSync(UPLOADS_DIR)) {
            mkdirSync(UPLOADS_DIR, { recursive: true });
        }
    }

    async generateForPoi(
        poiId: string,
        language: MediaLanguage,
        text: string,
        voice?: string,
    ) {
        const poi = await this.prisma.poi.findFirst({
            where: { id: poiId, deletedAt: null },
        });
        if (!poi) throw new NotFoundException('POI not found');

        const voiceName = voice || VOICE_MAP[language]?.default;
        if (!voiceName) {
            throw new BadRequestException(
                `Không hỗ trợ ngôn ngữ: ${language}. Chỉ hỗ trợ VI và EN.`,
            );
        }

        const tts = new MsEdgeTTS();
        await tts.setMetadata(
            voiceName,
            OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3,
        );

        const fileId = randomUUID();
        const fileName = `${poiId}_${language.toLowerCase()}_${fileId}`;
        const outputDir = join(UPLOADS_DIR, fileName);

        // msedge-tts toFile() expects the path as a directory and writes audio.mp3 inside it
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
        }

        const { audioFilePath } = await tts.toFile(
            outputDir,
            text,
        );
        tts.close();

        this.logger.log(
            `TTS generated: ${audioFilePath} for POI ${poiId} (${language})`,
        );

        const stats = statSync(audioFilePath);
        const relativePath = audioFilePath
            .replace(process.cwd(), '')
            .replace(/\\/g, '/');

        // Archive old TTS audio for this POI + language
        await this.prisma.poiMedia.updateMany({
            where: {
                poiId,
                type: 'AUDIO',
                language,
                originalName: { startsWith: 'tts_' },
            },
            data: { orderIndex: -1 }, // Mark as archived
        });

        // Create new media record
        const media = await this.prisma.poiMedia.create({
            data: {
                poiId,
                type: 'AUDIO',
                language,
                url: relativePath,
                originalName: `tts_${language.toLowerCase()}_${Date.now()}.mp3`,
                sizeBytes: stats.size,
                orderIndex: 0,
            },
        });

        return {
            id: media.id,
            url: media.url,
            language: media.language,
            sizeBytes: media.sizeBytes,
            voice: voiceName,
        };
    }

    async getAvailableVoices(language?: string) {
        const tts = new MsEdgeTTS();
        const voices = await tts.getVoices();
        tts.close();

        if (language) {
            return voices.filter((v) =>
                v.Locale.toLowerCase().startsWith(language.toLowerCase()),
            );
        }

        // Return only VI and EN voices by default
        return voices.filter(
            (v) =>
                v.Locale.startsWith('vi') || v.Locale.startsWith('en-US'),
        );
    }

    async deleteArchivedAudio() {
        const archived = await this.prisma.poiMedia.findMany({
            where: {
                type: 'AUDIO',
                originalName: { startsWith: 'tts_' },
                orderIndex: -1,
                createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            },
        });

        let deleted = 0;
        for (const media of archived) {
            const filePath = join(process.cwd(), media.url);
            if (existsSync(filePath)) {
                unlinkSync(filePath);
            }
            await this.prisma.poiMedia.delete({ where: { id: media.id } });
            deleted++;
        }

        this.logger.log(`Cleaned up ${deleted} archived TTS files`);
        return { deleted };
    }
}
