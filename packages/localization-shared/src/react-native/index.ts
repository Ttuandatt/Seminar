// Same exports as web - tree-shaking will handle mutations at runtime via capabilities check
export type {
  BCP47Language,
  SupportedLanguage,
  PoiLocalization,
  ListLocalizationsResponse,
  SaveLocalizationsRequest,
  SaveLocalizationsResponse,
  LocalizationRequest,
  LocalizationRequestResponse,
  LocalizationActionEvent,
  LocalizationDropdownViewEvent,
  MobileLanguageSwitchEvent,
  LocalizationCacheEvictionEvent,
  UsePoiLocalizationsState,
  UsePoiLocalizationsOptions,
  LocalizationClientConfig,
} from '../types';

export { createBCP47Language, isBCP47Language } from '../types';

export { LocalizationClient, createLocalizationClient } from '../client';

export {
  validateLocalizationName,
  validateLocalizationDescription,
  computeDiff,
  isStaleLastSyncedAt,
} from '../utils';

export type { LocalizationDiff } from '../utils';

export { usePoiLocalizations } from '../usePoiLocalizations';

export type { UsePoiLocalizationsReturn } from '../usePoiLocalizations';
