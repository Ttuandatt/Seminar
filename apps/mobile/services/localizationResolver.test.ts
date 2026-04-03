import { describe, expect, it } from 'vitest';
import { resolvePoiAudioState, resolvePoiTextState } from './localizationResolver';
import type { Poi } from './publicService';

type MediaItem = {
  type: string;
  language?: string;
  url?: string;
  originalName?: string;
};

const makePoi = (overrides?: Partial<Poi> & { media?: MediaItem[] }): Poi => ({
  id: 'poi-1',
  nameVi: 'Ten viet',
  nameEn: 'English name',
  descriptionVi: 'Mo ta viet',
  descriptionEn: 'English description',
  latitude: 10.7,
  longitude: 106.6,
  category: 'DINING',
  media: overrides?.media ?? [],
  ...overrides,
});

describe('WS4 localization resolver', () => {
  it('Case A: vi text+audio available uses exact vi audio', () => {
    const poi = makePoi({
      media: [
        { type: 'AUDIO', language: 'vi', url: '/a/vi.mp3', originalName: 'tts_vi_1.mp3' },
        { type: 'AUDIO', language: 'en', url: '/a/en.mp3', originalName: 'tts_en_1.mp3' },
      ],
    });

    const text = resolvePoiTextState(poi, 'vi');
    const audio = resolvePoiAudioState(poi, 'vi');

    expect(text.requestedLanguage).toBe('vi');
    expect(text.resolvedLanguage).toBe('vi');
    expect(text.isFallback).toBe(false);
    expect(audio.exactLanguageAvailable).toBe(true);
    expect(audio.exactAudioUrl).toBe('/a/vi.mp3');
  });

  it('Case B: en text available but no en audio does not auto-fallback', () => {
    const poi = makePoi({
      media: [{ type: 'AUDIO', language: 'vi', url: '/a/vi.mp3', originalName: 'tts_vi_1.mp3' }],
    });

    const text = resolvePoiTextState(poi, 'en');
    const audio = resolvePoiAudioState(poi, 'en');

    expect(text.resolvedLanguage).toBe('en');
    expect(text.isFallback).toBe(false);
    expect(audio.exactLanguageAvailable).toBe(false);
    expect(audio.exactAudioUrl).toBeNull();
    expect(audio.fallbackOptions.map((x) => x.language)).toContain('vi');
  });

  it('Case C: ja with translated text keeps ja text and still no auto audio fallback', () => {
    const poi = makePoi({
      media: [{ type: 'AUDIO', language: 'en', url: '/a/en.mp3', originalName: 'tts_en_1.mp3' }],
    });

    const text = resolvePoiTextState(poi, 'ja', 'Nihongo title', 'Nihongo body');
    const audio = resolvePoiAudioState(poi, 'ja');

    expect(text.requestedLanguage).toBe('ja');
    expect(text.resolvedLanguage).toBe('ja');
    expect(text.isFallback).toBe(false);
    expect(text.name).toBe('Nihongo title');
    expect(audio.exactAudioUrl).toBeNull();
    expect(audio.fallbackOptions.length).toBeGreaterThan(0);
  });

  it('Case D: ja without translation falls back text to vi, audio remains explicit fallback only', () => {
    const poi = makePoi({
      media: [
        { type: 'AUDIO', language: 'vi', url: '/a/vi.mp3', originalName: 'tts_vi_1.mp3' },
        { type: 'AUDIO', language: 'en', url: '/a/en.mp3', originalName: 'tts_en_1.mp3' },
      ],
    });

    const text = resolvePoiTextState(poi, 'ja');
    const audio = resolvePoiAudioState(poi, 'ja');

    expect(text.requestedLanguage).toBe('ja');
    expect(text.isFallback).toBe(true);
    expect(text.resolvedLanguage).toBe('vi');
    expect(audio.exactAudioUrl).toBeNull();
    expect(audio.fallbackOptions.map((x) => x.language)).toEqual(expect.arrayContaining(['vi', 'en']));
  });

  it('marks unavailable when no audio exists', () => {
    const poi = makePoi({ media: [] });
    const audio = resolvePoiAudioState(poi, 'en');

    expect(audio.isUnavailable).toBe(true);
    expect(audio.exactAudioUrl).toBeNull();
    expect(audio.fallbackOptions).toEqual([]);
  });
});
