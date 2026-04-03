// useSupportedLanguages.ts
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { SupportedLanguage } from '@localization-shared';

export type UserRole = 'admin' | 'shopOwner';

export function useSupportedLanguages(role: UserRole = 'admin') {
  const { data: languages = [], isLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['supported-languages', role],
    queryFn: async () => {
      const res = await fetch('/admin-api/supported-languages');
      if (!res.ok) throw new Error('Failed to fetch languages');
      const json = await res.json();

      // Filter based on role
      if (role === 'shopOwner') {
        return json.filter((l: SupportedLanguage) => l.enabled);
      }
      return json.filter((l: SupportedLanguage) => l.enabled);
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 48 * 60 * 60 * 1000 // 48 hours (formerly cacheTime)
  });

  const isCatalogStale = useCallback(() => {
    // Check if data is older than 24h
    if (!dataUpdatedAt) return false;
    const now = Date.now();
    const age = now - dataUpdatedAt;
    const STALE_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours
    return age > STALE_THRESHOLD;
  }, [dataUpdatedAt]);

  return {
    languages,
    isLoading,
    refetch,
    isCatalogStale
  };
}
