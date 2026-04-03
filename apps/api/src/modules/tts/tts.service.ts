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
    JA: {
        default: 'ja-JP-NanamiNeural',
        alternatives: ['ja-JP-KeitaNeural'],
    },
    KO: {
        default: 'ko-KR-SunHiNeural',
        alternatives: ['ko-KR-InJoonNeural'],
    },
    'ZH_CN': {
        default: 'zh-CN-XiaoxiaoNeural',
        alternatives: ['zh-CN-YunxiNeural'],
    },
    'ZH_TW': {
        default: 'zh-TW-HsiaoChenNeural',
        alternatives: ['zh-TW-YunJheNeural'],
    },
    FR: {
        default: 'fr-FR-DeniseNeural',
        alternatives: ['fr-FR-HenriNeural'],
    },
    DE: {
        default: 'de-DE-KatjaNeural',
        alternatives: ['de-DE-ConradNeural'],
    },
    ES: {
        default: 'es-ES-ElviraNeural',
        alternatives: ['es-ES-AlvaroNeural'],
    },
    TH: {
        default: 'th-TH-PremwadeeNeural',
        alternatives: ['th-TH-NiwatNeural'],
    },
    RU: {
        default: 'ru-RU-SvetlanaNeural',
        alternatives: ['ru-RU-DmitryNeural'],
    },
};

const UPLOADS_DIR = join(process.cwd(), 'uploads', 'tts');

import { TranslateService } from '../translate/translate.service';

// Map TTS language codes to Google Translate language codes
const LANG_TO_TRANSLATE_CODE: Record<string, string> = {
    VI: 'vi',
    EN: 'en',
    JA: 'ja',
    KO: 'ko',
    'ZH_CN': 'zh-CN',
    'ZH_TW': 'zh-TW',
    FR: 'fr',
    DE: 'de',
    ES: 'es',
    TH: 'th',
    RU: 'ru',
};

@Injectable()
export class TtsService {
    private readonly logger = new Logger(TtsService.name);

    constructor(
        private prisma: PrismaService,
        private translateService: TranslateService,
    ) {
        if (!existsSync(UPLOADS_DIR)) {
            mkdirSync(UPLOADS_DIR, { recursive: true });
        }
    }

    async generateForPoi(
        poiId: string,
        language: string,
        text: string,
        voice?: string,
    ) {
        const poi = await this.prisma.poi.findFirst({
            where: { id: poiId, deletedAt: null },
        });
        if (!poi) throw new NotFoundException('POI not found');

        const languageCode = language.toUpperCase().replace('_', '-');
        const dbLanguage = this.toMediaLanguage(languageCode);

        const voiceName = voice || VOICE_MAP[languageCode]?.default || VOICE_MAP[dbLanguage]?.default;
        if (!voiceName) {
            throw new BadRequestException(
                `Không hỗ trợ ngôn ngữ: ${languageCode}. Hỗ trợ: ${Object.keys(VOICE_MAP).join(', ')}`,
            );
        }

        const tts = new MsEdgeTTS();
        await tts.setMetadata(
            voiceName,
            OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3,
        );

        const fileId = randomUUID();
        const fileName = `${poiId}_${dbLanguage.toLowerCase()}_${fileId}`;
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
            `TTS generated: ${audioFilePath} for POI ${poiId} (${dbLanguage})`,
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
                language: dbLanguage,
                originalName: { startsWith: 'tts_' },
            },
            data: { orderIndex: -1 }, // Mark as archived
        });

        // Create new media record
        const media = await this.prisma.poiMedia.create({
            data: {
                poiId,
                type: 'AUDIO',
                language: dbLanguage,
                url: relativePath,
                originalName: `tts_${dbLanguage.toLowerCase()}_${Date.now()}.mp3`,
                sizeBytes: stats.size,
                orderIndex: 0,
            },
        });

        return {
            id: media.id,
            url: media.url,
            language: this.toClientLanguage(media.language),
            sizeBytes: media.sizeBytes,
            voice: voiceName,
        };
    }

    /**
     * Auto-translate text from source language to target language, then generate TTS.
     * This is the main flow: user writes Vietnamese → system translates → generates audio.
     */
    async generateWithTranslation(
        poiId: string,
        targetLanguage: string, // e.g. 'EN', 'JA', 'KO'
        sourceText: string,
        sourceLanguage: string = 'VI',
        voice?: string,
    ) {
        let finalText = sourceText;
        const srcCode = LANG_TO_TRANSLATE_CODE[sourceLanguage.toUpperCase()] || sourceLanguage.toLowerCase();
        const tgtCode = LANG_TO_TRANSLATE_CODE[targetLanguage.toUpperCase()] || targetLanguage.toLowerCase();

        // Only translate if source and target are different
        if (srcCode !== tgtCode) {
            this.logger.log(`Translating [${srcCode} → ${tgtCode}]: "${sourceText.substring(0, 50)}..."`);
            const result = await this.translateService.translate(sourceText, srcCode, tgtCode);
            finalText = result.translatedText;
            this.logger.log(`Translation result: "${finalText.substring(0, 50)}..."`);
        }

        const targetLangCode = targetLanguage.toUpperCase().replace('_', '-');
        const result = await this.generateForPoi(
            poiId,
            targetLangCode,
            finalText,
            voice || VOICE_MAP[targetLangCode]?.default,
        );

        return {
            ...result,
            translatedText: finalText,
            sourceLanguage: srcCode,
            targetLanguage: tgtCode,
        };
    }

    /**
     * Get supported TTS languages with their voices.
     */
    getSupportedTtsLanguages() {
        return Object.entries(VOICE_MAP).map(([code, voices]) => ({
            code,
            translateCode: LANG_TO_TRANSLATE_CODE[code] || code.toLowerCase(),
            defaultVoice: voices.default,
            alternatives: voices.alternatives,
        }));
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

    private toMediaLanguage(language: string): MediaLanguage {
        const normalized = language.toUpperCase().replace('-', '_');
        if ((Object.values(MediaLanguage) as string[]).includes(normalized)) {
            return normalized as MediaLanguage;
        }
        throw new BadRequestException(`Không hỗ trợ ngôn ngữ media: ${language}`);
    }

    private toClientLanguage(language: MediaLanguage | string): string {
        return String(language).toUpperCase().replace('_', '-');
    }
}
