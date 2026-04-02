import api from '../lib/api';

export interface TranslateResult {
    translatedText: string;
    from: string;
    to: string;
}

export interface TranslateBatchResult {
    translations: string[];
    from: string;
    to: string;
}

export interface SupportedLanguage {
    code: string;
    label: string;
    labelEn: string;
}

export const translateService = {
    /**
     * Translate a single text.
     */
    translate: async (text: string, from: string, to: string): Promise<TranslateResult> => {
        const response = await api.post<TranslateResult>('/translate', { text, from, to });
        return response.data;
    },

    /**
     * Translate multiple texts at once (batch).
     * Useful for translating POI name + description together.
     */
    translateBatch: async (texts: string[], from: string, to: string): Promise<TranslateBatchResult> => {
        const response = await api.post<TranslateBatchResult>('/translate/batch', { texts, from, to });
        return response.data;
    },

    /**
     * Get list of supported translation languages.
     */
    getSupportedLanguages: async (): Promise<SupportedLanguage[]> => {
        const response = await api.get<SupportedLanguage[]>('/translate/languages');
        return response.data;
    },
};
