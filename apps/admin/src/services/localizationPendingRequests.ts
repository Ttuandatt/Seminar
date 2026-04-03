export type PendingTranslationRequestLanguage = string;

export interface PendingTranslationRequest {
  poiId: string;
  language: PendingTranslationRequestLanguage;
  requestedAt: string;
}

const STORAGE_KEY = 'localization-pending-requests:v1';

function canUseStorage() {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function readPendingRequests(): PendingTranslationRequest[] {
  if (!canUseStorage()) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is PendingTranslationRequest => {
      return Boolean(
        item &&
        typeof item === 'object' &&
        typeof (item as PendingTranslationRequest).poiId === 'string' &&
        typeof (item as PendingTranslationRequest).language === 'string' &&
        typeof (item as PendingTranslationRequest).requestedAt === 'string'
      );
    });
  } catch {
    return [];
  }
}

function writePendingRequests(requests: PendingTranslationRequest[]) {
  if (!canUseStorage()) return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch {
    // Ignore storage write failures in the UI-only fallback path.
  }
}

function normalizePoiId(poiId: string) {
  return poiId.trim();
}

function normalizeLanguage(language: string) {
  return language.trim().toUpperCase();
}

function matchesRequest(
  request: PendingTranslationRequest,
  poiId: string,
  language: string,
) {
  return request.poiId === normalizePoiId(poiId) && request.language === normalizeLanguage(language);
}

export function isTranslationRequestPending(poiId: string, language: string): boolean {
  return readPendingRequests().some((request) => matchesRequest(request, poiId, language));
}

export function markTranslationRequestPending(poiId: string, language: string): void {
  const nextRequest: PendingTranslationRequest = {
    poiId: normalizePoiId(poiId),
    language: normalizeLanguage(language),
    requestedAt: new Date().toISOString(),
  };

  const nextRequests = readPendingRequests().filter(
    (request) => !matchesRequest(request, nextRequest.poiId, nextRequest.language),
  );

  nextRequests.push(nextRequest);
  writePendingRequests(nextRequests);
}

export function clearTranslationRequestPending(poiId: string, language: string): void {
  const nextRequests = readPendingRequests().filter(
    (request) => !matchesRequest(request, poiId, language),
  );

  writePendingRequests(nextRequests);
}

export function listPendingTranslationRequests(poiId: string): string[] {
  return readPendingRequests()
    .filter((request) => request.poiId === normalizePoiId(poiId))
    .map((request) => request.language);
}

export function clearAllPendingTranslationRequests(): void {
  writePendingRequests([]);
}
