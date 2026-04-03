import type { Poi } from './publicService';
import {
    AudioMedia,
    getAudioLanguageCode,
    getAudioLanguageLabel,
    getAudioTracks,
    normalizeLanguageCode,
    resolveExactAudioTrack,
    resolveFallbackAudioTracks,
} from '../utils/audioMedia';

export type LocalizedTextState = {
    requestedLanguage: string;
    resolvedLanguage: string;
    isFallback: boolean;
    name: string;
    description: string;
};

export type LocalizedAudioOption = {
    language: string;
    label: string;
    url: string;
};

export type LocalizedAudioState = {
    requestedLanguage: string;
    exactLanguageAvailable: boolean;
    exactAudioUrl: string | null;
    availableLanguages: string[];
    fallbackOptions: LocalizedAudioOption[];
    isUnavailable: boolean;
};

const resolveFallbackText = (poi: Poi, requestedLanguage: string) => {
    const language = normalizeLanguageCode(requestedLanguage);

    if (language === 'vi') {
        return {
            resolvedLanguage: 'vi',
            name: poi.nameVi,
            description: poi.descriptionVi || '',
            isFallback: false,
        };
    }

    if (language === 'en') {
        return {
            resolvedLanguage: 'en',
            name: poi.nameEn || poi.nameVi,
            description: poi.descriptionEn || poi.descriptionVi || '',
            isFallback: false,
        };
    }

    return null;
};

export const resolvePoiTextState = (
    poi: Poi,
    requestedLanguage: string,
    translatedName?: string | null,
    translatedDescription?: string | null,
): LocalizedTextState => {
    const language = normalizeLanguageCode(requestedLanguage);

    if (language === 'vi' || language === 'en') {
        const fallback = resolveFallbackText(poi, language)!;
        return {
            requestedLanguage: language,
            resolvedLanguage: fallback.resolvedLanguage,
            isFallback: fallback.isFallback,
            name: fallback.name,
            description: fallback.description,
        };
    }

    if (translatedName && translatedDescription) {
        return {
            requestedLanguage: language,
            resolvedLanguage: language,
            isFallback: false,
            name: translatedName,
            description: translatedDescription,
        };
    }

    const fallback = resolveFallbackText(poi, 'vi') || resolveFallbackText(poi, 'en');

    return {
        requestedLanguage: language,
        resolvedLanguage: fallback?.resolvedLanguage || 'vi',
        isFallback: true,
        name: fallback?.name || poi.nameVi,
        description: fallback?.description || poi.descriptionVi || poi.descriptionEn || '',
    };
};

export const resolvePoiAudioState = (poi: Poi, requestedLanguage: string): LocalizedAudioState => {
    const language = normalizeLanguageCode(requestedLanguage);
    const tracks = getAudioTracks(poi.media as AudioMedia[] | undefined);
    const exactTrack = resolveExactAudioTrack(tracks, language);
    const fallbackTracks = resolveFallbackAudioTracks(tracks, language);

    const availableLanguages = Array.from(
        new Set(
            tracks
                .map((track) => getAudioLanguageCode(track))
                .filter(Boolean),
        ),
    );

    return {
        requestedLanguage: language,
        exactLanguageAvailable: Boolean(exactTrack?.url),
        exactAudioUrl: exactTrack?.url || null,
        availableLanguages,
        fallbackOptions: fallbackTracks
            .filter((track) => track.url)
            .map((track) => ({
                language: getAudioLanguageCode(track) || 'all',
                label: getAudioLanguageLabel(track),
                url: track.url as string,
            })),
        isUnavailable: !exactTrack && fallbackTracks.length === 0,
    };
};
