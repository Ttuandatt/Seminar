import { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { Poi } from '../services/publicService';
import { resolvePoiAudioState, resolvePoiTextState } from '../services/localizationResolver';

export function usePoiLocalization(
    poi: Poi | null,
    translatedName?: string | null,
    translatedDescription?: string | null,
) {
    const { lang, setLanguage } = useLanguage();

    const textState = useMemo(() => {
        if (!poi) return null;
        return resolvePoiTextState(poi, lang, translatedName, translatedDescription);
    }, [lang, poi, translatedDescription, translatedName]);

    const audioState = useMemo(() => {
        if (!poi) return null;
        return resolvePoiAudioState(poi, lang);
    }, [lang, poi]);

    return {
        activeLanguage: lang,
        setLanguage,
        textState,
        audioState,
    };
}
