/**
 * React Query hook for managing POI localizations with draft support
 * Handles state management, mutations, conflict detection, and analytics
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import type {
  BCP47Language,
  ListLocalizationsResponse,
  SaveLocalizationsRequest,
  PoiLocalization,
  UsePoiLocalizationsState,
  UsePoiLocalizationsOptions,
} from './types';
import { LocalizationClient, createLocalizationClient } from './client';
import {
  validateLocalizationName,
  validateLocalizationDescription,
} from './utils';

const QUERY_KEY_PREFIX = 'poi-localizations';

/**
 * Return type for usePoiLocalizations hook
 */
export interface UsePoiLocalizationsReturn {
  isLoading: boolean;
  isSaving: boolean;
  data: ListLocalizationsResponse | undefined;
  state: UsePoiLocalizationsState;
  editLanguage(language: BCP47Language, updates: Partial<PoiLocalization>): void;
  discardLanguage(language: BCP47Language): void;
  saveLanguage(language: BCP47Language): Promise<void>;
  deleteLanguage(language: BCP47Language): Promise<void>;
  refetch(): Promise<void>;
}

/**
 * usePoiLocalizations - React Query hook for managing POI localizations
 * Manages draft state, dirty tracking, mutation operations, and analytics
 */
export function usePoiLocalizations(
  poiId: string,
  options: UsePoiLocalizationsOptions
): UsePoiLocalizationsReturn {
  // =========================================================================
  // Refs & Client Initialization
  // =========================================================================

  // Initialize client once via ref to avoid recreating on each render
  const clientRef = useRef<LocalizationClient | null>(null);
  if (!clientRef.current) {
    clientRef.current = createLocalizationClient(options.clientConfig);
  }

  const queryClient = useQueryClient();

  // Track current mutation language
  const [currentMutationLanguage, setCurrentMutationLanguage] = useState<
    BCP47Language | null
  >(null);

  // =========================================================================
  // State Management
  // =========================================================================

  // Draft changes by language (not yet saved)
  const [draftByLanguage, setDraftByLanguage] = useState<
    Record<string, PoiLocalization>
  >({});

  // Dirty flag for each language (has unsaved changes)
  const [dirtyMap, setDirtyMap] = useState<Record<string, boolean>>({});

  // Validation errors by language
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Track previous dirty count to only emit when it changes
  const [previousDirtyCount, setPreviousDirtyCount] = useState(0);

  // =========================================================================
  // Data Fetching
  // =========================================================================

  const query = useQuery<ListLocalizationsResponse, Error>({
    queryKey: [QUERY_KEY_PREFIX, poiId],
    queryFn: async () => {
      return clientRef.current!.listPoiLocalizations(poiId);
    },
    staleTime: Infinity, // Data doesn't stale until invalidated
    retry: 3,
  });

  // =========================================================================
  // Mutations
  // =========================================================================

  const saveMutation = useMutation({
    mutationFn: async (payload: {
      language: BCP47Language;
      localization: PoiLocalization;
    }) => {
      setCurrentMutationLanguage(payload.language);

      if (!query.data) {
        throw new Error('No data available for save');
      }

      options.onMutationStart?.({
        action: 'save',
        language: payload.language,
      });

      const startTime = Date.now();

      try {
        // Find the current item to get all fields
        const currentItem = query.data.items.find(
          (item) => item.language === payload.language
        );

        if (!currentItem) {
          throw new Error(`Language ${payload.language} not found in server state`);
        }

        const request: SaveLocalizationsRequest = {
          lastSyncedAt: query.data.meta?.lastSyncedAt ?? new Date().toISOString(),
          items: [payload.localization],
        };

        const response = await clientRef.current!.savePoiLocalizations(
          poiId,
          request
        );

        const latencyMs = Date.now() - startTime;

        // Emit analytics
        options.onAnalytics?.({
          poiId,
          language: payload.language,
          action: 'save',
          role: 'admin', // Will be determined by caller
          latencyMs,
          success: true,
          timestamp: new Date().toISOString(),
        });

        options.onMutationComplete?.({
          action: 'save',
          language: payload.language,
          success: true,
        });

        return response;
      } catch (error) {
        const latencyMs = Date.now() - startTime;

        // Emit analytics on error
        options.onAnalytics?.({
          poiId,
          language: payload.language,
          action: 'save',
          role: 'admin',
          latencyMs,
          success: false,
          errorCode: error instanceof Error ? error.name : 'unknown',
          timestamp: new Date().toISOString(),
        });

        options.onMutationComplete?.({
          action: 'save',
          language: payload.language,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        throw error;
      }
    },
    onSuccess: (response, payload) => {
      // Update cache with new lastSyncedAt
      queryClient.setQueryData(
        [QUERY_KEY_PREFIX, poiId],
        (oldData: ListLocalizationsResponse | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            meta: {
              lastSyncedAt: response.meta?.lastSyncedAt ?? new Date().toISOString(),
            },
            items: oldData.items.map((item) =>
              item.language === payload.language ? payload.localization : item
            ),
          };
        }
      );

      // Clear draft and dirty for this language
      setDraftByLanguage((prev) => {
        const next = { ...prev };
        delete next[payload.language];
        return next;
      });

      setDirtyMap((prev) => {
        const next = { ...prev };
        delete next[payload.language];
        return next;
      });

      // Clear error for this language
      setErrors((prev) => {
        const next = { ...prev };
        delete next[payload.language];
        return next;
      });

      setCurrentMutationLanguage(null);
    },
    onError: () => {
      setCurrentMutationLanguage(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (language: BCP47Language) => {
      setCurrentMutationLanguage(language);

      options.onMutationStart?.({
        action: 'delete',
        language,
      });

      const startTime = Date.now();

      try {
        await clientRef.current!.deletePoiLocalization(poiId, language);

        const latencyMs = Date.now() - startTime;

        options.onAnalytics?.({
          poiId,
          language,
          action: 'delete',
          role: 'admin',
          latencyMs,
          success: true,
          timestamp: new Date().toISOString(),
        });

        options.onMutationComplete?.({
          action: 'delete',
          language,
          success: true,
        });
      } catch (error) {
        const latencyMs = Date.now() - startTime;

        options.onAnalytics?.({
          poiId,
          language,
          action: 'delete',
          role: 'admin',
          latencyMs,
          success: false,
          errorCode: error instanceof Error ? error.name : 'unknown',
          timestamp: new Date().toISOString(),
        });

        options.onMutationComplete?.({
          action: 'delete',
          language,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        throw error;
      }
    },
    onSuccess: (_, language) => {
      // Update cache to remove deleted language
      queryClient.setQueryData(
        [QUERY_KEY_PREFIX, poiId],
        (oldData: ListLocalizationsResponse | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            items: oldData.items.filter((item) => item.language !== language),
          };
        }
      );

      // Clear draft and dirty
      setDraftByLanguage((prev) => {
        const next = { ...prev };
        delete next[language];
        return next;
      });

      setDirtyMap((prev) => {
        const next = { ...prev };
        delete next[language];
        return next;
      });

      setErrors((prev) => {
        const next = { ...prev };
        delete next[language];
        return next;
      });

      setCurrentMutationLanguage(null);
    },
    onError: () => {
      setCurrentMutationLanguage(null);
    },
  });

  // =========================================================================
  // Callbacks
  // =========================================================================

  const editLanguage = useCallback(
    (language: BCP47Language, updates: Partial<PoiLocalization>) => {
      // Find current server version
      const serverItem = query.data?.items.find(
        (item) => item.language === language
      );

      if (!serverItem) {
        options.onError?.(new Error(`Language ${language} not found`));
        return;
      }

      // Merge updates with existing draft or server version
      const existingDraft = draftByLanguage[language] || serverItem;
      const updated = { ...existingDraft, ...updates };

      // Validate name and description
      const newErrors: Record<string, string> = {};

      const nameValidation = validateLocalizationName(updated.name);
      if (!nameValidation.valid) {
        newErrors.name = nameValidation.error || 'Invalid name';
      }

      const descValidation = validateLocalizationDescription(updated.description);
      if (!descValidation.valid) {
        newErrors.description = descValidation.error || 'Invalid description';
      }

      setErrors((prev) => {
        const next = { ...prev };
        if (Object.keys(newErrors).length > 0) {
          next[language] = Object.values(newErrors).join('; ');
        } else {
          delete next[language];
        }
        return next;
      });

      // Update draft and mark as dirty
      setDraftByLanguage((prev) => ({
        ...prev,
        [language]: updated,
      }));

      setDirtyMap((prev) => ({
        ...prev,
        [language]: true,
      }));
    },
    [draftByLanguage, query.data, options]
  );

  const discardLanguage = useCallback((language: BCP47Language) => {
    // Reset to server version
    setDraftByLanguage((prev) => {
      const next = { ...prev };
      delete next[language];
      return next;
    });

    setDirtyMap((prev) => {
      const next = { ...prev };
      delete next[language];
      return next;
    });

    setErrors((prev) => {
      const next = { ...prev };
      delete next[language];
      return next;
    });
  }, []);

  const saveLanguage = useCallback(
    async (language: BCP47Language) => {
      // Get draft or fall back to server version
      const serverItem = query.data?.items.find(
        (item) => item.language === language
      );

      if (!serverItem) {
        throw new Error(`Language ${language} not found`);
      }

      const draft = draftByLanguage[language] || serverItem;

      // Validate before saving
      const nameValidation = validateLocalizationName(draft.name);
      if (!nameValidation.valid) {
        throw new Error(nameValidation.error || 'Invalid name');
      }

      const descValidation = validateLocalizationDescription(draft.description);
      if (!descValidation.valid) {
        throw new Error(descValidation.error || 'Invalid description');
      }

      // Send mutation
      await saveMutation.mutateAsync({
        language,
        localization: draft,
      });
    },
    [draftByLanguage, query.data, saveMutation]
  );

  const deleteLanguage = useCallback(
    async (language: BCP47Language) => {
      await deleteMutation.mutateAsync(language);
    },
    [deleteMutation]
  );

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  // =========================================================================
  // Dirty State Emission
  // =========================================================================

  // Count dirty languages
  const dirtyCount = useMemo(
    () => Object.values(dirtyMap).filter(Boolean).length,
    [dirtyMap]
  );

  // Emit onDirtyChange only when dirty count actually changes
  useEffect(() => {
    if (dirtyCount !== previousDirtyCount) {
      options.onDirtyChange?.(dirtyCount);
      setPreviousDirtyCount(dirtyCount);
    }
  }, [dirtyCount, previousDirtyCount, options]);

  // =========================================================================
  // Build Return State
  // =========================================================================

  const state: UsePoiLocalizationsState = {
    items: query.data?.items || [],
    draftByLanguage,
    dirtyMap,
    errors,
    pendingMutation: (saveMutation.isPending || deleteMutation.isPending) && currentMutationLanguage
      ? {
          type: (saveMutation.isPending ? 'save' : 'delete') as 'save' | 'delete',
          language: currentMutationLanguage,
          startedAt: new Date().toISOString(),
        }
      : null,
    lastSyncedAt: query.data?.meta?.lastSyncedAt,
    lastFetchedAt: query.dataUpdatedAt
      ? new Date(query.dataUpdatedAt).toISOString()
      : undefined,
  };

  const isSaving = saveMutation.isPending || deleteMutation.isPending;

  return {
    isLoading: query.isLoading,
    isSaving,
    data: query.data,
    state,
    editLanguage,
    discardLanguage,
    saveLanguage,
    deleteLanguage,
    refetch,
  };
}
