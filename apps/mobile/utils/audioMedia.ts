export type AudioMedia = {
    id?: string;
    type?: string;
    url?: string;
    language?: string;
    originalName?: string;
    orderIndex?: number;
};

const LANGUAGE_LABELS: Record<string, string> = {
    vi: 'Tiếng Việt',
    en: 'English',
    ja: '日本語',
    ko: '한국어',
    'zh-cn': '中文 (Giản thể)',
    'zh-tw': '中文 (Phồn thể)',
    fr: 'Français',
    de: 'Deutsch',
    es: 'Español',
    th: 'ไทย',
    ru: 'Русский',
    all: 'Tất cả ngôn ngữ',
};

export const normalizeLanguageCode = (value?: string | null) => {
    if (!value) return '';
    return value.trim().replaceAll('_', '-').toLowerCase();
};

const extractLanguageFromText = (value?: string | null) => {
    if (!value) return '';

    const normalizedValue = value.trim();

    const originalNameMatch = /^tts[_-]([a-z]{2}(?:[-_][a-z]{2})?|all)_/i.exec(normalizedValue);
    if (originalNameMatch?.[1]) {
        return normalizeLanguageCode(originalNameMatch[1]);
    }

    const urlSegments = normalizedValue.split('/').filter(Boolean);
    const folderName = urlSegments.at(-2) || '';
    if (folderName) {
        const folderTokens = folderName.split('_').filter(Boolean);
        if (folderTokens.length >= 3) {
            const candidate = folderTokens.at(-2) || '';
            const normalizedCandidate = normalizeLanguageCode(candidate);
            if (normalizedCandidate) {
                return normalizedCandidate;
            }
        }
    }

    return '';
};

export const getAudioLanguageCode = (media?: AudioMedia | null) => {
    if (!media) return '';

    const fromOriginalName = extractLanguageFromText(media.originalName);
    if (fromOriginalName) return fromOriginalName;

    const fromUrl = extractLanguageFromText(media.url);
    if (fromUrl) return fromUrl;

    return normalizeLanguageCode(media.language);
};

export const getAudioLanguageLabel = (media?: AudioMedia | null) => {
    const code = getAudioLanguageCode(media);
    if (!code) return 'Audio';
    return LANGUAGE_LABELS[code] || code.toUpperCase();
};

export const getAudioTracks = (media: AudioMedia[] | undefined | null) => {
    return (media || []).filter((item) => item.type === 'AUDIO');
};

const languageBase = (value: string) => value.split('-')[0];

const languageMatches = (trackLanguage: string, requestedLanguage: string) => {
    if (!trackLanguage || !requestedLanguage) return false;
    if (trackLanguage === 'all' || requestedLanguage === 'all') return false;

    return (
        trackLanguage === requestedLanguage ||
        languageBase(trackLanguage) === languageBase(requestedLanguage)
    );
};

export const resolveExactAudioTrack = (media: AudioMedia[] | undefined | null, requestedLanguage: string) => {
    const audioTracks = getAudioTracks(media);
    if (audioTracks.length === 0) return null;

    const desiredLanguage = normalizeLanguageCode(requestedLanguage);

    return (
        audioTracks.find((track) => languageMatches(getAudioLanguageCode(track), desiredLanguage)) ||
        null
    );
};

export const resolveFallbackAudioTracks = (media: AudioMedia[] | undefined | null, requestedLanguage?: string) => {
    const audioTracks = getAudioTracks(media);
    if (audioTracks.length === 0) return [];

    const requested = normalizeLanguageCode(requestedLanguage);
    const exactTrack = requested ? resolveExactAudioTrack(audioTracks, requested) : null;
    const exactUrl = exactTrack?.url;

    const fallbackCandidates = audioTracks.filter((track) => {
        const languageCode = getAudioLanguageCode(track);
        if (!languageCode || languageCode === 'all') return true;
        if (exactUrl && track.url === exactUrl) return false;
        return ['vi', 'en'].includes(languageCode);
    });

    const seen = new Set<string>();
    return fallbackCandidates.filter((track) => {
        const code = getAudioLanguageCode(track) || track.url || track.id || '';
        if (!code || seen.has(code)) return false;
        seen.add(code);
        return true;
    });
};
