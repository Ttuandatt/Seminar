import { describe, expect, it } from 'vitest';
import {
  getAudioLanguageCode,
  getAudioLanguageLabel,
  normalizeLanguageCode,
  resolveExactAudioTrack,
  resolveFallbackAudioTracks,
  type AudioMedia,
} from './audioMedia';

const audio = (overrides: Partial<AudioMedia>): AudioMedia => ({
  type: 'AUDIO',
  ...overrides,
});

describe('audioMedia utils', () => {
  it('normalizes language codes with underscore and casing', () => {
    expect(normalizeLanguageCode(' EN_us ')).toBe('en-us');
    expect(normalizeLanguageCode('VI')).toBe('vi');
  });

  it('extracts language from originalName first', () => {
    const media = audio({
      originalName: 'tts_ja_1775187468581.mp3',
      url: '/uploads/tts/poi_vi_x/audio.mp3',
      language: 'en',
    });

    expect(getAudioLanguageCode(media)).toBe('ja');
    expect(getAudioLanguageLabel(media)).toBe('日本語');
  });

  it('extracts language from url folder when originalName is absent', () => {
    const media = audio({
      url: '/uploads/tts/31a3a3e2-9a8b-4de0-919c-95059cb4ec24_zh-cn_abcd/audio.mp3',
    });

    expect(getAudioLanguageCode(media)).toBe('zh-cn');
    expect(getAudioLanguageLabel(media)).toBe('中文 (Giản thể)');
  });

  it('resolveExactAudioTrack supports base-language matching and excludes all', () => {
    const tracks: AudioMedia[] = [
      audio({ language: 'all', url: '/a/all.mp3' }),
      audio({ language: 'en', url: '/a/en.mp3' }),
      audio({ language: 'zh-cn', url: '/a/zh-cn.mp3' }),
    ];

    expect(resolveExactAudioTrack(tracks, 'en-US')?.url).toBe('/a/en.mp3');
    expect(resolveExactAudioTrack(tracks, 'zh-TW')?.url).toBe('/a/zh-cn.mp3');
    expect(resolveExactAudioTrack(tracks, 'all')).toBeNull();
  });

  it('resolveFallbackAudioTracks returns vi/en/all candidates and removes exact + duplicates', () => {
    const tracks: AudioMedia[] = [
      audio({ language: 'vi', url: '/a/vi-1.mp3' }),
      audio({ language: 'vi', url: '/a/vi-2.mp3' }),
      audio({ language: 'en', url: '/a/en.mp3' }),
      audio({ language: 'all', url: '/a/all.mp3' }),
      audio({ language: 'ja', url: '/a/ja.mp3' }),
    ];

    const fallbacksForEn = resolveFallbackAudioTracks(tracks, 'en');
    const urlsForEn = fallbacksForEn.map((x) => x.url);
    const langsForEn = fallbacksForEn.map((x) => getAudioLanguageCode(x));

    expect(urlsForEn).not.toContain('/a/en.mp3');
    expect(langsForEn.filter((l) => l === 'vi').length).toBe(1);
    expect(urlsForEn).toContain('/a/all.mp3');
    expect(urlsForEn).not.toContain('/a/ja.mp3');

    const fallbacksForJa = resolveFallbackAudioTracks(tracks, 'ja');
    const urlsForJa = fallbacksForJa.map((x) => x.url);

    expect(urlsForJa).toContain('/a/vi-1.mp3');
    expect(urlsForJa).toContain('/a/en.mp3');
    expect(urlsForJa).toContain('/a/all.mp3');
    expect(urlsForJa).not.toContain('/a/ja.mp3');
  });
});
