import { useCallback, useState } from 'react';
import { poiService } from '../services/poi.service';

type SupportedLanguage = 'VI' | 'EN';

export interface EnsurePoiResult {
    poiId?: string | null;
    handled?: boolean;
}

export interface UsePoiTtsParams {
    getPoiId: () => string | undefined | null;
    getDescriptionFor: (language: SupportedLanguage) => string | undefined | null;
    getSourceDescriptionFor?: (language: SupportedLanguage) => string | undefined | null;
    refreshMedia?: (poiId?: string) => Promise<void>;
    onSuccessToast: (language: SupportedLanguage) => void;
    onErrorToast: (language: SupportedLanguage, message: string) => void;
    getMissingPoiMessage?: (language: SupportedLanguage) => string;
    getShortDescriptionMessage?: (language: SupportedLanguage) => string;
    getTranslationFallbackMessage?: (language: SupportedLanguage) => string;
    ensurePoiExists?: (language: SupportedLanguage) => Promise<EnsurePoiResult | string | void | undefined>;
    beforeGenerate?: (language: SupportedLanguage, poiId: string) => Promise<void> | void;
    afterGenerate?: (language: SupportedLanguage, poiId: string) => Promise<void> | void;
}

export const usePoiTts = ({
    getPoiId,
    getDescriptionFor,
    getSourceDescriptionFor,
    refreshMedia,
    onSuccessToast,
    onErrorToast,
    getMissingPoiMessage,
    getShortDescriptionMessage,
    getTranslationFallbackMessage,
    ensurePoiExists,
    beforeGenerate,
    afterGenerate,
}: UsePoiTtsParams) => {
    const [generating, setGenerating] = useState<Partial<Record<SupportedLanguage, boolean>>>({});

    const toggleGenerating = useCallback((language: SupportedLanguage, value: boolean) => {
        setGenerating((prev) => ({ ...prev, [language]: value }));
    }, []);

    const generateTts = useCallback(
        async (language: SupportedLanguage) => {
            let poiId = getPoiId() ?? undefined;
            let missingHandled = false;

            if (!poiId && ensurePoiExists) {
                try {
                    const ensured = await ensurePoiExists(language);
                    if (typeof ensured === 'string') {
                        poiId = ensured;
                    } else if (ensured && typeof ensured === 'object') {
                        if (ensured.poiId) {
                            poiId = ensured.poiId || undefined;
                        }
                        missingHandled = Boolean(ensured.handled);
                    }
                } catch (error) {
                    console.error('ensurePoiExists error:', error);
                    missingHandled = true;
                }
            }

            if (!poiId) {
                if (!missingHandled) {
                    const message = getMissingPoiMessage?.(language) || 'POI needs to be saved before generating TTS.';
                    onErrorToast(language, message);
                }
                return;
            }

            try {
                await beforeGenerate?.(language, poiId);
            } catch (error) {
                console.error('beforeGenerate error:', error);
            }

            const text = (getDescriptionFor(language) || '').trim();
            if (text.length < 10) {
                const sourceText = (getSourceDescriptionFor?.(language) || '').trim();
                const canFallbackTranslate = language !== 'VI' && sourceText.length >= 10;

                if (canFallbackTranslate) {
                    toggleGenerating(language, true);
                    try {
                        await poiService.generateTranslatedTts(poiId, sourceText, language, 'VI');
                        if (refreshMedia) {
                            await refreshMedia(poiId);
                        }
                        try {
                            await afterGenerate?.(language, poiId);
                        } catch (error) {
                            console.error('afterGenerate error:', error);
                        }
                        const fallbackMessage = getTranslationFallbackMessage?.(language);
                        if (fallbackMessage) {
                            onErrorToast(language, fallbackMessage);
                        }
                        onSuccessToast(language);
                        return;
                    } catch (error) {
                        console.error('POI translated TTS generation error:', error);
                    } finally {
                        toggleGenerating(language, false);
                    }
                }

                const message = getShortDescriptionMessage?.(language) || 'Description must contain at least 10 characters.';
                onErrorToast(language, message);
                return;
            }

            toggleGenerating(language, true);
            try {
                await poiService.generateTts(poiId, text, language);
                if (refreshMedia) {
                    await refreshMedia(poiId);
                }
                try {
                    await afterGenerate?.(language, poiId);
                } catch (error) {
                    console.error('afterGenerate error:', error);
                }
                onSuccessToast(language);
            } catch (error) {
                console.error('POI TTS generation error:', error);
                let message = 'Không thể tạo audio. Vui lòng thử lại.';
                if (typeof error === 'object' && error !== null && 'response' in error) {
                    const response = (error as { response?: { data?: { message?: unknown } } }).response;
                    if (response?.data?.message) {
                        const { message: responseMessage } = response.data;
                        message = Array.isArray(responseMessage)
                            ? responseMessage.join('. ')
                            : String(responseMessage);
                    }
                }
                onErrorToast(language, message);
            } finally {
                toggleGenerating(language, false);
            }
        },
        [
            getPoiId,
            getDescriptionFor,
            getSourceDescriptionFor,
            getMissingPoiMessage,
            getShortDescriptionMessage,
            getTranslationFallbackMessage,
            onErrorToast,
            onSuccessToast,
            refreshMedia,
            toggleGenerating,
            ensurePoiExists,
            beforeGenerate,
            afterGenerate,
        ],
    );

    return { generating, generateTts };
};

export default usePoiTts;
