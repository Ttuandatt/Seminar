import { useCallback, useState } from 'react';
import { poiService } from '../services/poi.service';

export interface EnsurePoiResult {
    poiId?: string | null;
    handled?: boolean;
}

export interface UsePoiTtsParams {
    getPoiId: () => string | undefined | null;
    getDescriptionFor: (language: string) => string | undefined | null;
    getSourceDescriptionFor?: (language: string) => string | undefined | null;
    refreshMedia?: (poiId?: string) => Promise<void>;
    onSuccessToast: (language: string) => void;
    onErrorToast: (language: string, message: string) => void;
    getMissingPoiMessage?: (language: string) => string;
    getShortDescriptionMessage?: (language: string) => string;
    getTranslationFallbackMessage?: (language: string) => string;
    ensurePoiExists?: (language: string) => Promise<EnsurePoiResult | string | void | undefined>;
    beforeGenerate?: (language: string, poiId: string) => Promise<void> | void;
    afterGenerate?: (language: string, poiId: string) => Promise<void> | void;
}

function normalizeLanguage(language: string) {
    return language.trim().toUpperCase();
}

function isDirectLanguage(language: string) {
    return language === 'VI' || language === 'EN';
}

async function refreshGeneratedMedia(refreshMedia: UsePoiTtsParams['refreshMedia'], poiId: string) {
    if (refreshMedia) {
        await refreshMedia(poiId);
    }
}

async function runAfterGenerate(
    afterGenerate: UsePoiTtsParams['afterGenerate'],
    onSuccessToast: UsePoiTtsParams['onSuccessToast'],
    language: string,
    poiId: string,
) {
    try {
        await afterGenerate?.(language, poiId);
    } catch (error) {
        console.error('afterGenerate error:', error);
    }

    onSuccessToast(language);
}

function extractErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const response = (error as { response?: { data?: { message?: unknown } } }).response;
        const message = response?.data?.message;

        if (message) {
            if (Array.isArray(message)) {
                return message.map((item) => (typeof item === 'string' ? item : JSON.stringify(item))).join('. ');
            }

            return typeof message === 'string' ? message : JSON.stringify(message);
        }
    }

    return 'Không thể tạo audio. Vui lòng thử lại.';
}

async function resolvePoiId(
    getPoiId: UsePoiTtsParams['getPoiId'],
    ensurePoiExists: UsePoiTtsParams['ensurePoiExists'],
    language: string,
): Promise<{ poiId?: string; missingHandled: boolean }> {
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

    return { poiId, missingHandled };
}

async function generateForLanguage(args: {
    poiId: string;
    language: string;
    text: string;
    sourceText: string;
    refreshMedia?: UsePoiTtsParams['refreshMedia'];
    onSuccessToast: UsePoiTtsParams['onSuccessToast'];
    onErrorToast: UsePoiTtsParams['onErrorToast'];
    getShortDescriptionMessage?: UsePoiTtsParams['getShortDescriptionMessage'];
    getTranslationFallbackMessage?: UsePoiTtsParams['getTranslationFallbackMessage'];
    afterGenerate?: UsePoiTtsParams['afterGenerate'];
}) {
    const {
        poiId,
        language,
        text,
        sourceText,
        refreshMedia,
        onSuccessToast,
        onErrorToast,
        getShortDescriptionMessage,
        getTranslationFallbackMessage,
        afterGenerate,
    } = args;

    const normalizedLanguage = normalizeLanguage(language);

    if (!isDirectLanguage(normalizedLanguage)) {
        const sourceTextToUse = sourceText || text;
        if (sourceTextToUse.length < 10) {
            onErrorToast(language, getShortDescriptionMessage?.(language) || 'Description must contain at least 10 characters.');
            return;
        }

        await poiService.generateTranslatedTts(poiId, sourceTextToUse, normalizedLanguage, 'VI');
        await refreshGeneratedMedia(refreshMedia, poiId);

        const fallbackMessage = getTranslationFallbackMessage?.(language);
        if (fallbackMessage) {
            onErrorToast(language, fallbackMessage);
        }

        await runAfterGenerate(afterGenerate, onSuccessToast, language, poiId);
        return;
    }

    if (normalizedLanguage === 'EN' && text.length < 10 && sourceText.length >= 10) {
        await poiService.generateTranslatedTts(poiId, sourceText, normalizedLanguage, 'VI');
        await refreshGeneratedMedia(refreshMedia, poiId);
        const fallbackMessage = getTranslationFallbackMessage?.(language);
        if (fallbackMessage) {
            onErrorToast(language, fallbackMessage);
        }
        await runAfterGenerate(afterGenerate, onSuccessToast, language, poiId);
        return;
    }

    if (text.length < 10) {
        onErrorToast(language, getShortDescriptionMessage?.(language) || 'Description must contain at least 10 characters.');
        return;
    }

    await poiService.generateTts(poiId, text, normalizedLanguage);
    await refreshGeneratedMedia(refreshMedia, poiId);
    await runAfterGenerate(afterGenerate, onSuccessToast, language, poiId);
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
    const [generating, setGenerating] = useState<Partial<Record<string, boolean>>>({});

    const toggleGenerating = useCallback((language: string, value: boolean) => {
        setGenerating((prev) => ({ ...prev, [language]: value }));
    }, []);

    const generateTts = useCallback(
        async (language: string) => {
            const { poiId, missingHandled } = await resolvePoiId(getPoiId, ensurePoiExists, language);

            if (!poiId) {
                if (!missingHandled) {
                    onErrorToast(language, getMissingPoiMessage?.(language) || 'POI needs to be saved before generating TTS.');
                }
                return;
            }

            try {
                await beforeGenerate?.(language, poiId);
            } catch (error) {
                console.error('beforeGenerate error:', error);
            }

            toggleGenerating(language, true);
            try {
                const text = (getDescriptionFor(language) || '').trim();
                const sourceText = (getSourceDescriptionFor?.(language) || '').trim();
                await generateForLanguage({
                    poiId,
                    language,
                    text,
                    sourceText,
                    refreshMedia,
                    onSuccessToast,
                    onErrorToast,
                    getShortDescriptionMessage,
                    getTranslationFallbackMessage,
                    afterGenerate,
                });
            } catch (error) {
                console.error('POI TTS generation error:', error);
                onErrorToast(language, extractErrorMessage(error));
            } finally {
                toggleGenerating(language, false);
            }
        },
        [
            afterGenerate,
            beforeGenerate,
            ensurePoiExists,
            getDescriptionFor,
            getMissingPoiMessage,
            getPoiId,
            getShortDescriptionMessage,
            getSourceDescriptionFor,
            getTranslationFallbackMessage,
            onErrorToast,
            onSuccessToast,
            refreshMedia,
            toggleGenerating,
        ],
    );

    return { generating, generateTts };
};

export default usePoiTts;
