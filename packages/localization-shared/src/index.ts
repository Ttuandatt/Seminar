/**
 * Main export file for localization-shared package
 * Exports types, client, utilities, and React hooks
 */

// ============================================================================
// Types
// ============================================================================

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
} from './types';

export { createBCP47Language, isBCP47Language } from './types';

// ============================================================================
// Client
// ============================================================================

export { LocalizationClient, createLocalizationClient } from './client';

// ============================================================================
// Utilities
// ============================================================================

export {
  validateLocalizationName,
  validateLocalizationDescription,
  computeDiff,
  isStaleLastSyncedAt,
} from './utils';

export type { LocalizationDiff } from './utils';

// ============================================================================
// React Hooks
// ============================================================================

export { usePoiLocalizations } from './usePoiLocalizations';

export type { UsePoiLocalizationsReturn } from './usePoiLocalizations';
