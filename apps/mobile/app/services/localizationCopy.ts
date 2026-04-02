export type LocalizationCopyKey =
  | 'ws4.fallback.showing'
  | 'ws4.pending.note'
  | 'ws4.stale.notice'
  | 'ws4.request.cta'
  | 'ws4.empty.title'
  | 'ws4.empty.body';

const COPY: Record<LocalizationCopyKey, string> = {
  'ws4.fallback.showing': 'Showing {fallbackLanguageLabel} - translation not available yet',
  'ws4.pending.note': 'Yêu cầu đang chờ xử lý',
  'ws4.stale.notice': 'Content may be outdated',
  'ws4.request.cta': 'Request translation',
  'ws4.empty.title': 'No content available',
  'ws4.empty.body': 'This POI has no displayable content in the selected or fallback languages yet.',
};

export function getLocalizationCopy(
  key: LocalizationCopyKey,
  params?: Record<string, string>,
): string {
  let text = COPY[key] || key;
  if (!params) return text;

  for (const [paramKey, value] of Object.entries(params)) {
    text = text.replace(`{${paramKey}}`, value);
  }

  return text;
}
