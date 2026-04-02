import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'localizationPendingRequests:v1';

export interface PendingTranslationRequest {
  poiId: string;
  language: string;
  requestedAt: string;
}

async function readAllPendingRequests(): Promise<PendingTranslationRequest[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is PendingTranslationRequest => {
      if (!item || typeof item !== 'object') return false;
      const value = item as PendingTranslationRequest;
      return (
        typeof value.poiId === 'string' &&
        typeof value.language === 'string' &&
        typeof value.requestedAt === 'string'
      );
    });
  } catch {
    return [];
  }
}

async function writeAllPendingRequests(items: PendingTranslationRequest[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function normalizeLanguage(language: string) {
  return language.trim().toUpperCase();
}

export async function listPendingRequestsForPoi(poiId: string): Promise<PendingTranslationRequest[]> {
  const all = await readAllPendingRequests();
  return all.filter((item) => item.poiId === poiId);
}

export async function isTranslationRequestPending(
  poiId: string,
  language: string,
): Promise<boolean> {
  const normalizedLanguage = normalizeLanguage(language);
  const items = await readAllPendingRequests();

  return items.some(
    (item) => item.poiId === poiId && normalizeLanguage(item.language) === normalizedLanguage,
  );
}

export async function markTranslationRequestPending(
  poiId: string,
  language: string,
): Promise<void> {
  const normalizedLanguage = normalizeLanguage(language);
  const all = await readAllPendingRequests();

  const remaining = all.filter(
    (item) => !(item.poiId === poiId && normalizeLanguage(item.language) === normalizedLanguage),
  );

  remaining.push({
    poiId,
    language: normalizedLanguage,
    requestedAt: new Date().toISOString(),
  });

  await writeAllPendingRequests(remaining);
}

export async function clearTranslationRequestPending(
  poiId: string,
  language: string,
): Promise<void> {
  const normalizedLanguage = normalizeLanguage(language);
  const all = await readAllPendingRequests();

  const remaining = all.filter(
    (item) => !(item.poiId === poiId && normalizeLanguage(item.language) === normalizedLanguage),
  );

  await writeAllPendingRequests(remaining);
}
