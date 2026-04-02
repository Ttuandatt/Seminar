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

    /**
     * Translate a single text from one language to another.
     * Uses Google Translate (free, no API key required).
     */
    async translate(text: string, from: string, to: string): Promise<{ translatedText: string; from: string; to: string }> {
        if (!text?.trim()) {
            return { translatedText: '', from, to };
        }

        try {
            const translate = await getTranslator();
            const result = await translate(text, { from, to });
            
            this.logger.log(`Translated [${from} → ${to}]: "${text.substring(0, 50)}..." → "${result.text.substring(0, 50)}..."`);
            
            return {
                translatedText: result.text,
                from: result.from?.language?.iso || from,
                to,
            };
        } catch (error) {
            this.logger.error(`Translation failed [${from} → ${to}]:`, error);
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
        const translate = await getTranslator();
        
        const results = await Promise.all(
            texts.map(async (text) => {
                if (!text?.trim()) return '';
                try {
                    const result = await translate(text, { from, to });
                    return result.text;
                } catch (error) {
                    this.logger.error(`Batch translation failed for: "${text.substring(0, 30)}..."`, error);
                    return text; // Return original on failure
                }
            }),
        );

        return { translations: results, from, to };
    }

    /**
     * Get list of supported languages for the frontend.
     */
    getSupportedLanguages() {
        return SUPPORTED_LANGUAGES;
    }
}
