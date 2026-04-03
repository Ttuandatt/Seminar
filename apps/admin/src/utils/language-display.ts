const LANGUAGE_DISPLAY_NAMES: Record<string, { vi: string; en: string }> = {
  VI: { vi: 'Tiếng Việt', en: 'Vietnamese' },
  EN: { vi: 'Tiếng Anh', en: 'English' },
  JA: { vi: 'Tiếng Nhật', en: 'Japanese' },
  KO: { vi: 'Tiếng Hàn', en: 'Korean' },
  'ZH-CN': { vi: 'Tiếng Trung (Giản thể)', en: 'Chinese (Simplified)' },
  'ZH-TW': { vi: 'Tiếng Trung (Phồn thể)', en: 'Chinese (Traditional)' },
  FR: { vi: 'Tiếng Pháp', en: 'French' },
  DE: { vi: 'Tiếng Đức', en: 'German' },
  ES: { vi: 'Tiếng Tây Ban Nha', en: 'Spanish' },
  TH: { vi: 'Tiếng Thái', en: 'Thai' },
  RU: { vi: 'Tiếng Nga', en: 'Russian' },
};

const LANGUAGE_ORDER = ['VI', 'EN', 'JA', 'KO', 'ZH-CN', 'ZH-TW', 'FR', 'DE', 'ES', 'TH', 'RU'] as const;

export type UiLanguageLocale = 'vi' | 'en';

export function normalizeLanguageCode(language: string) {
  return language.trim().toUpperCase();
}

export function getLanguageCodeLabel(language: string) {
  return normalizeLanguageCode(language);
}

export function getLanguageDisplayName(language: string, locale: UiLanguageLocale = 'vi') {
  const normalizedLanguage = normalizeLanguageCode(language);
  return LANGUAGE_DISPLAY_NAMES[normalizedLanguage]?.[locale] ?? normalizedLanguage;
}

export function getLanguageOptions(locale: UiLanguageLocale = 'vi') {
  return LANGUAGE_ORDER.map((code) => ({
    code,
    label: getLanguageDisplayName(code, locale),
  }));
}

export function getTtsActionLabel(language: string, locale: UiLanguageLocale = 'vi') {
  const code = getLanguageCodeLabel(language);
  return locale === 'vi' ? `Tạo audio ${code}` : `Generate audio ${code}`;
}
