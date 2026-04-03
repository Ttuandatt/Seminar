import {
    Injectable,
    BadRequestException,
    NotFoundException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { MediaLanguage } from '@prisma/client';
import { join } from 'node:path';
import { existsSync, mkdirSync, statSync, unlinkSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

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
    'ZH-CN': {
        default: 'zh-CN-XiaoxiaoNeural',
        alternatives: ['zh-CN-YunxiNeural'],
    },
    'ZH-TW': {
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
    'ZH-CN': 'zh-CN',
    'ZH-TW': 'zh-TW',
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
        private readonly prisma: PrismaService,
        private readonly translateService: TranslateService,
    ) {
        if (!existsSync(UPLOADS_DIR)) {
            mkdirSync(UPLOADS_DIR, { recursive: true });
        }
    }

    async generateForPoi(
        poiId: string,
        language: MediaLanguage,
        text: string,
        voice?: string,
        fileLanguage: string = language,
    ) {
        const poi = await this.prisma.poi.findFirst({
            where: { id: poiId, deletedAt: null },
        });
        if (!poi) throw new NotFoundException('POI not found');

        const voiceName = voice || VOICE_MAP[language]?.default || VOICE_MAP[language.toUpperCase()]?.default;
        if (!voiceName) {
            throw new BadRequestException(
                `Không hỗ trợ ngôn ngữ: ${language}. Hỗ trợ: ${Object.keys(VOICE_MAP).join(', ')}`,
            );
        }

        const tts = new MsEdgeTTS();
        await tts.setMetadata(
            voiceName,
            OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3,
        );

        const fileId = randomUUID();
        const fileLanguageCode = fileLanguage.toLowerCase();
        const fileName = `${poiId}_${fileLanguageCode}_${fileId}`;
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
            `TTS generated: ${audioFilePath} for POI ${poiId} (${fileLanguage})`,
        );

        const stats = statSync(audioFilePath);
        const relativePath = audioFilePath
            .replace(process.cwd(), '')
            .replaceAll('\\', '/');

        // Archive old TTS audio for this POI + language
        await this.prisma.poiMedia.updateMany({
            where: {
                poiId,
                type: 'AUDIO',
                originalName: { startsWith: `tts_${fileLanguageCode}_` },
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
                originalName: `tts_${fileLanguageCode}_${Date.now()}.mp3`,
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

        // Map target language to MediaLanguage enum (DB only supports VI, EN, ALL)
        // For non-VI/EN languages, we store as 'EN' (foreign) with a descriptive name
        const dbLanguage: MediaLanguage = targetLanguage.toUpperCase() === 'VI' ? MediaLanguage.VI : MediaLanguage.EN;

        const result = await this.generateForPoi(
            poiId,
            dbLanguage,
            finalText,
            voice || VOICE_MAP[targetLanguage.toUpperCase()]?.default,
            targetLanguage.toUpperCase(),
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
}
