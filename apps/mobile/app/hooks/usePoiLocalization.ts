import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Poi } from '../../services/publicService';
import {
  getEnabledLanguages,
  getLanguageLabel,
  hasDisplayableContent,
  mapPoiToLocalizedContent,
  type LanguageCode,
} from '../services/localizationAdapter';
import {
  deriveLanguageStatuses,
  normalizeLanguage,
  resolveContentLanguage,
  resolveInitialLanguage,
} from '../services/localizationResolver';
import { getLocalizationCopy } from '../services/localizationCopy';
import {
  getSelectedLanguageForPoi,
  setSelectedLanguageForPoi,
} from '../services/localizationSelectionStorage';
import {
  isTranslationRequestPending,
  listPendingRequestsForPoi,
  markTranslationRequestPending,
} from '../services/localizationPendingRequests';

interface UsePoiLocalizationOptions {
  isRefreshing?: boolean;
  isUsingCachedPoi?: boolean;
}

interface ContentResult {
  name: string;
  description: string;
  fallback: boolean;
  fallbackLanguage: string;
  fallbackNote: string | null;
  hasTranslation: boolean;
  hasDisplayableContent: boolean;
}

export function usePoiLocalization(
  poiId: string,
  poi: Poi | null,
  options?: UsePoiLocalizationOptions,
) {
  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>('VI');
  const [appLanguage, setAppLanguage] = useState<string>('VI');
  const [pendingLanguages, setPendingLanguages] = useState<Set<string>>(new Set());

  const localizedContent = useMemo(() => mapPoiToLocalizedContent(poi), [poi]);
  const availableLanguages = useMemo(() => getEnabledLanguages().filter((item) => item.enabled), []);

  useEffect(() => {
    let mounted = true;

    async function loadInitialLanguage() {
      const [lastSelected, appLanguageKey, legacyAppLanguageKey] = await Promise.all([
        getSelectedLanguageForPoi(poiId),
        AsyncStorage.getItem('app_language'),
        AsyncStorage.getItem('appLanguage'),
      ]);

      const resolvedAppLanguage = normalizeLanguage(appLanguageKey || legacyAppLanguageKey) || 'VI';
      const initialLanguage = resolveInitialLanguage({
        enabledLanguages: availableLanguages.map((item) => item.code),
        lastSelected,
        appLanguage: resolvedAppLanguage,
      });

      if (!mounted) return;

      setAppLanguage(resolvedAppLanguage);
      setActiveLanguage(initialLanguage);
    }

    async function loadPendingState() {
      const pending = await listPendingRequestsForPoi(poiId);
      if (!mounted) return;
      setPendingLanguages(new Set(pending.map((item) => normalizeLanguage(item.language))));
    }

    loadInitialLanguage();
    loadPendingState();

    return () => {
      mounted = false;
    };
  }, [poiId, availableLanguages]);

  const setLanguage = useCallback(
    async (language: string) => {
      const normalized = normalizeLanguage(language);
      if (normalized !== 'VI' && normalized !== 'EN') return;

      setActiveLanguage(normalized);
      await setSelectedLanguageForPoi(poiId, normalized);
    },
    [poiId],
  );

  const isPending = useCallback(
    (language: string) => pendingLanguages.has(normalizeLanguage(language)),
    [pendingLanguages],
  );

  const requestTranslation = useCallback(
    async (language: string) => {
      const normalized = normalizeLanguage(language);
      if (!normalized) return;

      const pending = await isTranslationRequestPending(poiId, normalized);
      if (pending) return;

      await markTranslationRequestPending(poiId, normalized);
      setPendingLanguages((previous) => {
        const next = new Set(previous);
        next.add(normalized);
        return next;
      });
    },
    [poiId],
  );

  const getContent = useCallback(
    (language: string = activeLanguage): ContentResult => {
      const selected = normalizeLanguage(language) || 'VI';

      const hasContentByLanguage: Record<string, boolean> = {
        VI: hasDisplayableContent(localizedContent.VI),
        EN: hasDisplayableContent(localizedContent.EN),
      };

      const resolution = resolveContentLanguage({
        selectedLanguage: selected,
        hasContentByLanguage,
      });

      const chosen = localizedContent[resolution.language as LanguageCode];
      const hasTranslation = hasContentByLanguage[selected] || false;
      const fallbackLabel = getLanguageLabel(resolution.language);

      return {
        name: chosen?.name || '',
        description: chosen?.description || '',
        fallback: resolution.fallback,
        fallbackLanguage: resolution.language,
        fallbackNote: resolution.fallback
          ? getLocalizationCopy('ws4.fallback.showing', {
              fallbackLanguageLabel: fallbackLabel,
            })
          : null,
        hasTranslation,
        hasDisplayableContent: resolution.hasDisplayableContent,
      };
    },
    [activeLanguage, localizedContent],
  );

  const getStatusesForLanguage = useCallback(
    (language: string): string[] => {
      const normalized = normalizeLanguage(language);
      const content = localizedContent[normalized as LanguageCode];

      return deriveLanguageStatuses({
        appDefaultLanguage: normalizeLanguage(appLanguage) === normalized ? normalized : '',
        hasDisplayableContent: hasDisplayableContent(content),
        isPending: isPending(normalized),
      });
    },
    [appLanguage, isPending, localizedContent],
  );

  const isStale = Boolean(options?.isUsingCachedPoi && options?.isRefreshing);

  return {
    availableLanguages,
    activeLanguage,
    setLanguage,
    getContent,
    isPending,
    requestTranslation,
    getStatusesForLanguage,
    staleNotice: isStale ? getLocalizationCopy('ws4.stale.notice') : null,
  };
}
