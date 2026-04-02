import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearAllPendingTranslationRequests,
  clearTranslationRequestPending,
  isTranslationRequestPending,
  listPendingTranslationRequests,
  markTranslationRequestPending,
} from '../localizationPendingRequests';

describe('localizationPendingRequests', () => {
  beforeEach(() => {
    localStorage.clear();
    clearAllPendingTranslationRequests();
  });

  it('persists pending state by poiId and language', () => {
    markTranslationRequestPending('poi-1', 'EN');

    expect(isTranslationRequestPending('poi-1', 'EN')).toBe(true);
    expect(isTranslationRequestPending('poi-1', 'VI')).toBe(false);
  });

  it('survives a module reload because storage is the source of truth', async () => {
    markTranslationRequestPending('poi-1', 'EN');

    const module = await import('../localizationPendingRequests');
    expect(module.isTranslationRequestPending('poi-1', 'EN')).toBe(true);
  });

  it('can clear one pending entry without affecting others', () => {
    markTranslationRequestPending('poi-1', 'EN');
    markTranslationRequestPending('poi-1', 'VI');

    clearTranslationRequestPending('poi-1', 'EN');

    expect(isTranslationRequestPending('poi-1', 'EN')).toBe(false);
    expect(isTranslationRequestPending('poi-1', 'VI')).toBe(true);
  });

  it('lists all pending entries for a POI', () => {
    markTranslationRequestPending('poi-1', 'EN');
    markTranslationRequestPending('poi-1', 'VI');

    expect(listPendingTranslationRequests('poi-1')).toEqual(['EN', 'VI']);
  });
});