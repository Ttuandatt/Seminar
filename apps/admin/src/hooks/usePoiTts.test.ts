import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { usePoiTts, type UsePoiTtsParams } from './usePoiTts';

const mockGenerateTts = vi.fn();

vi.mock('../services/poi.service', () => ({
    poiService: {
        generateTts: mockGenerateTts,
    },
}));

const createBaseParams = (overrides: Partial<UsePoiTtsParams> = {}) => ({
    getPoiId: () => 'poi-123',
    getDescriptionFor: () => 'This is a valid description',
    refreshMedia: vi.fn().mockResolvedValue(undefined),
    onSuccessToast: vi.fn(),
    onErrorToast: vi.fn(),
    ...overrides,
});

describe('usePoiTts lifecycle hooks', () => {
    beforeEach(() => {
        mockGenerateTts.mockReset();
    });

    it('calls beforeGenerate even when description is too short', async () => {
        const beforeGenerate = vi.fn().mockResolvedValue(undefined);
        const params = createBaseParams({ getDescriptionFor: () => 'short' });
        const { result } = renderHook(() =>
            usePoiTts({ ...params, beforeGenerate } as UsePoiTtsParams),
        );

        await act(async () => {
            await result.current.generateTts('VI');
        });

        expect(beforeGenerate).toHaveBeenCalledWith('VI', 'poi-123');
        expect(mockGenerateTts).not.toHaveBeenCalled();
    });

    it('continues when beforeGenerate rejects', async () => {
        const beforeGenerate = vi.fn().mockRejectedValue(new Error('cleanup failed'));
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        mockGenerateTts.mockResolvedValue(undefined);

        const { result } = renderHook(() =>
            usePoiTts({ ...createBaseParams(), beforeGenerate } as UsePoiTtsParams),
        );

        await act(async () => {
            await result.current.generateTts('VI');
        });

        expect(mockGenerateTts).toHaveBeenCalledTimes(1);
        expect(beforeGenerate).toHaveBeenCalledWith('VI', 'poi-123');

        consoleErrorSpy.mockRestore();
    });

    it('invokes afterGenerate after refreshMedia resolves', async () => {
        const callOrder: string[] = [];
        mockGenerateTts.mockImplementation(async () => {
            callOrder.push('generate');
        });

        const refreshMedia = vi.fn(async () => {
            callOrder.push('refresh');
        });
        const afterGenerate = vi.fn(async () => {
            callOrder.push('after');
        });

        const { result } = renderHook(() =>
            usePoiTts({ ...createBaseParams({ refreshMedia }), afterGenerate } as UsePoiTtsParams),
        );

        await act(async () => {
            await result.current.generateTts('VI');
        });

        expect(afterGenerate).toHaveBeenCalledWith('VI', 'poi-123');
        expect(refreshMedia).toHaveBeenCalledWith('poi-123');
        expect(callOrder).toEqual(['generate', 'refresh', 'after']);
    });

    it('does not invoke afterGenerate when TTS fails', async () => {
        mockGenerateTts.mockRejectedValue(new Error('tts failed'));
        const afterGenerate = vi.fn();
        const onErrorToast = vi.fn();
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const { result } = renderHook(() =>
            usePoiTts({ ...createBaseParams({ onErrorToast }), afterGenerate } as UsePoiTtsParams),
        );

        await act(async () => {
            await result.current.generateTts('VI');
        });

        expect(afterGenerate).not.toHaveBeenCalled();
        expect(onErrorToast).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
    });
});
