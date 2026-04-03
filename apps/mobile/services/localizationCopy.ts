const LANGUAGE_LABELS: Record<string, string> = {
    vi: 'tiếng Việt',
    en: 'tiếng Anh',
    ja: 'tiếng Nhật',
    ko: 'tiếng Hàn',
    'zh-cn': 'tiếng Trung (Giản thể)',
    'zh-tw': 'tiếng Trung (Phồn thể)',
    fr: 'tiếng Pháp',
    de: 'tiếng Đức',
    es: 'tiếng Tây Ban Nha',
    th: 'tiếng Thái',
    ru: 'tiếng Nga',
};

const normalizeLanguageCode = (value?: string | null) => {
    if (!value) return '';
    return value.trim().replace(/_/g, '-').toLowerCase();
};

export const getLanguageLabel = (language?: string | null) => {
    const normalized = normalizeLanguageCode(language);
    if (!normalized) return '';
    return LANGUAGE_LABELS[normalized] || normalized.toUpperCase();
};

export const getFallbackTextNote = (resolvedLanguage?: string | null, requestedLanguage?: string | null) => {
    const resolvedLabel = getLanguageLabel(resolvedLanguage);
    const requestedLabel = getLanguageLabel(requestedLanguage);

    if (!resolvedLabel || !requestedLabel || resolvedLanguage === requestedLanguage) return '';
    return `Đang hiển thị ${resolvedLabel} vì chưa có bản dịch ${requestedLabel}`;
};

export const getMissingAudioNote = (requestedLanguage?: string | null) => {
    const label = getLanguageLabel(requestedLanguage);
    if (!label) return 'Chưa có audio cho ngôn ngữ này';
    return `Chưa có audio ${label} cho địa điểm này`;
};

export const getNoAudioAvailableNote = () => 'Chưa có audio cho địa điểm này';

export const getFallbackAudioLabel = (language?: string | null) => {
    const label = getLanguageLabel(language);
    if (!label) return 'Nghe audio';
    return `Nghe bằng ${label}`;
};
