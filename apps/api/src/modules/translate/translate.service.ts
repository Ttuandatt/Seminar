import { Injectable, Logger } from '@nestjs/common';

// google-translate-api-x is ESM-only, so we use dynamic import
let translateFn: any = null;

async function getTranslator() {
    if (!translateFn) {
        const mod = await (eval('import("google-translate-api-x")') as Promise<any>);
        translateFn = mod.default || mod;
    }
    return translateFn;
}

// Supported languages for display in frontend
export const SUPPORTED_LANGUAGES = [
    { code: 'vi', label: 'Tiếng Việt', labelEn: 'Vietnamese' },
    { code: 'en', label: 'English', labelEn: 'English' },
    { code: 'ja', label: '日本語', labelEn: 'Japanese' },
    { code: 'ko', label: '한국어', labelEn: 'Korean' },
    { code: 'zh-CN', label: '中文 (简体)', labelEn: 'Chinese (Simplified)' },
    { code: 'zh-TW', label: '中文 (繁體)', labelEn: 'Chinese (Traditional)' },
    { code: 'fr', label: 'Français', labelEn: 'French' },
    { code: 'de', label: 'Deutsch', labelEn: 'German' },
    { code: 'es', label: 'Español', labelEn: 'Spanish' },
    { code: 'th', label: 'ไทย', labelEn: 'Thai' },
    { code: 'ru', label: 'Русский', labelEn: 'Russian' },
];

@Injectable()
export class TranslateService {
    private readonly logger = new Logger(TranslateService.name);

    private normalizeLanguageCode(lang: string): string {
        const lower = lang.toLowerCase().replace('_', '-');
        if (lower === 'zh-cn') return 'zh-CN';
        if (lower === 'zh-tw') return 'zh-TW';
        return lower;
    }

    /**
     * Translate a single text from one language to another.
     * Uses Google Translate (free, no API key required).
     */
    async translate(text: string, from: string, to: string): Promise<{ translatedText: string; from: string; to: string }> {
        if (!text?.trim()) {
            return { translatedText: '', from, to };
        }

        const fromLang = this.normalizeLanguageCode(from);
        const toLang = this.normalizeLanguageCode(to);

        try {
            const translate = await getTranslator();
            const result = await translate(text, { from: fromLang, to: toLang });
            
            this.logger.log(`Translated [${fromLang} → ${toLang}]: "${text.substring(0, 50)}..." → "${result.text.substring(0, 50)}..."`);
            
            return {
                translatedText: result.text,
                from: result.from?.language?.iso || fromLang,
                to: toLang,
            };
        } catch (error) {
            this.logger.error(`Translation failed [${fromLang} → ${toLang}]:`, error);
            throw error;
        }
    }

    /**
     * Translate multiple texts at once (batch).
     * Each text is translated independently to preserve context per field.
     */
    async translateBatch(
        texts: string[],
        from: string,
        to: string,
    ): Promise<{ translations: string[]; from: string; to: string }> {
        const fromLang = this.normalizeLanguageCode(from);
        const toLang = this.normalizeLanguageCode(to);

        this.logger.log(`Batch translating ${texts.length} items [${fromLang} → ${toLang}]`);

        // Use Promise.all to translate everything. If one fails, the whole batch fails.
        const results = await Promise.all(
            texts.map(async (text) => {
                if (!text?.trim()) return '';
                const result = await this.translate(text, fromLang, toLang);
                return result.translatedText;
            }),
        );

        return { translations: results, from: fromLang, to: toLang };
    }

    /**
     * Get list of supported languages for the frontend.
     */
    getSupportedLanguages() {
        return SUPPORTED_LANGUAGES;
    }
}
