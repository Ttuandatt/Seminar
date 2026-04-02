import type { LanguageCode } from './localizationAdapter';

export interface ResolveInitialLanguageInput {
  enabledLanguages: string[];
  lastSelected: string | null;
  appLanguage: string | null;
}

export interface ResolveContentLanguageInput {
  selectedLanguage: string;
  hasContentByLanguage: Record<string, boolean>;
}

export interface ResolveContentLanguageResult {
  language: string;
  fallback: boolean;
  hasDisplayableContent: boolean;
}

export function normalizeLanguage(language: string | null | undefined): string {
  return (language || '').trim().toUpperCase();
}

export function resolveInitialLanguage(input: ResolveInitialLanguageInput): LanguageCode {
  const enabled = new Set(input.enabledLanguages.map((item) => normalizeLanguage(item)).filter(Boolean));

  const candidates = [
    normalizeLanguage(input.lastSelected),
    normalizeLanguage(input.appLanguage),
    'EN',
    'VI',
  ].filter(Boolean);

  const selected = candidates.find((candidate) => enabled.has(candidate));

  if (selected === 'EN' || selected === 'VI') {
    return selected;
  }

  if (enabled.has('EN')) return 'EN';
  return 'VI';
}

export function resolveContentLanguage(
  input: ResolveContentLanguageInput,
): ResolveContentLanguageResult {
  const selected = normalizeLanguage(input.selectedLanguage);

  if (input.hasContentByLanguage[selected]) {
    return {
      language: selected,
      fallback: false,
      hasDisplayableContent: true,
    };
  }

  if (input.hasContentByLanguage.VI) {
    return {
      language: 'VI',
      fallback: true,
      hasDisplayableContent: true,
    };
  }

  if (input.hasContentByLanguage.EN) {
    return {
      language: 'EN',
      fallback: true,
      hasDisplayableContent: true,
    };
  }

  return {
    language: selected || 'VI',
    fallback: false,
    hasDisplayableContent: false,
  };
}

export interface DeriveLanguageStatusesInput {
  appDefaultLanguage: string;
  hasDisplayableContent: boolean;
  isPending: boolean;
}

export function deriveLanguageStatuses(input: DeriveLanguageStatusesInput): string[] {
  const statuses: string[] = [];

  if (normalizeLanguage(input.appDefaultLanguage)) {
    statuses.push('App default');
  }

  statuses.push(input.hasDisplayableContent ? 'Translated' : 'Missing');

  if (input.isPending) {
    statuses.push('Pending');
  }

  return statuses;
}
