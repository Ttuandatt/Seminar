import type { Poi } from '../../services/publicService';

export type LanguageCode = 'VI' | 'EN';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  enabled: boolean;
}

export interface LocalizationContent {
  name: string;
  description: string;
}

export type LocalizedContentByLanguage = Partial<Record<LanguageCode, LocalizationContent>>;

const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  VI: 'Vietnamese',
  EN: 'English',
};

const ENABLED_LANGUAGES: LanguageOption[] = [
  { code: 'VI', label: LANGUAGE_LABELS.VI, enabled: true },
  { code: 'EN', label: LANGUAGE_LABELS.EN, enabled: true },
];

function normalizeText(value?: string | null): string {
  return (value || '').trim();
}

export function getEnabledLanguages(): LanguageOption[] {
  return ENABLED_LANGUAGES;
}

export function mapPoiToLocalizedContent(poi: Poi | null): LocalizedContentByLanguage {
  if (!poi) return {};

  return {
    VI: {
      name: normalizeText(poi.nameVi),
      description: normalizeText(poi.descriptionVi),
    },
    EN: {
      name: normalizeText(poi.nameEn),
      description: normalizeText(poi.descriptionEn),
    },
  };
}

export function hasDisplayableContent(content?: LocalizationContent): boolean {
  if (!content) return false;
  return Boolean(content.name) && Boolean(content.description);
}

export function getLanguageLabel(language: string): string {
  const normalized = language.trim().toUpperCase() as LanguageCode;
  return LANGUAGE_LABELS[normalized] || normalized;
}
