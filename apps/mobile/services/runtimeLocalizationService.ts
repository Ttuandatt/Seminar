const GOOGLE_TRANSLATE_ENDPOINT = 'https://translate.googleapis.com/translate_a/single';

const translateCache = new Map<string, string>();

function normalizeLanguageCode(language: string): string {
    const normalized = (language || '').trim().toLowerCase();

    if (normalized === 'zh-cn') return 'zh-CN';
    if (normalized === 'zh-tw') return 'zh-TW';

    return normalized;
}

function buildCacheKey(text: string, from: string, to: string): string {
    return `${from}->${to}::${text}`;
}

export async function translateTextRuntime(text: string, from: string, to: string): Promise<string> {
    const sourceText = (text || '').trim();
    if (!sourceText) return '';

    const fromLang = normalizeLanguageCode(from) || 'auto';
    const toLang = normalizeLanguageCode(to);

    if (!toLang || fromLang === toLang) {
        return sourceText;
    }

    const cacheKey = buildCacheKey(sourceText, fromLang, toLang);
    const cached = translateCache.get(cacheKey);
    if (cached) {
        return cached;
    }

    const url = `${GOOGLE_TRANSLATE_ENDPOINT}?client=gtx&sl=${encodeURIComponent(fromLang)}&tl=${encodeURIComponent(toLang)}&dt=t&q=${encodeURIComponent(sourceText)}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Translation request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const translated = Array.isArray(payload?.[0])
        ? payload[0].map((chunk: any) => String(chunk?.[0] || '')).join('')
        : sourceText;

    const resolved = translated.trim() || sourceText;
    translateCache.set(cacheKey, resolved);
    return resolved;
}

export function buildGoogleTtsUrl(text: string, language: string): string | null {
    const sourceText = (text || '').trim();
    if (!sourceText) return null;

    const ttsLanguage = normalizeLanguageCode(language);
    if (!ttsLanguage) return null;

    const cappedText = sourceText.slice(0, 200);
    return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(ttsLanguage)}&q=${encodeURIComponent(cappedText)}`;
}
