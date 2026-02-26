import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { getMediaUrl } from '../services/api';

type AudioContextType = {
    currentPoiId: string | null;
    currentAudioUrl: string | null;
    isPlaying: boolean;
    position: number;
    duration: number;
    playGlobalAudio: (audioUrl: string, poiId: string) => void;
    pauseGlobalAudio: () => void;
    resumeGlobalAudio: () => void;
    seekGlobalAudio: (positionMillis: number) => void;
    stopAndClearAudio: () => void;
};

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
    const [currentPoiId, setCurrentPoiId] = useState<string | null>(null);

    // Provide the URL wrapped in getMediaUrl to useAudioPlayer
    const fullSource = currentAudioUrl ? getMediaUrl(currentAudioUrl) : null;

    // We use one central player for the whole app
    const player = useAudioPlayer(fullSource, {
        updateInterval: 500,
        downloadFirst: false,
    });

    const status = useAudioPlayerStatus(player);

    // Watch for source changes to auto-play
    useEffect(() => {
        if (fullSource) {
            player.replace(fullSource);
            player.play();
        } else {
            player.pause();
        }
    }, [fullSource]);

    const playGlobalAudio = (audioUrl: string, poiId: string) => {
        // If it's a new POI, this will trigger the useEffect above to replace & play
        if (poiId !== currentPoiId || audioUrl !== currentAudioUrl) {
            setCurrentPoiId(poiId);
            setCurrentAudioUrl(audioUrl);
        } else {
            // Same POI, just resume
            player.play();
        }
    };

    const pauseGlobalAudio = () => {
        player.pause();
    };

    const resumeGlobalAudio = () => {
        player.play();
    };

    const seekGlobalAudio = (positionMillis: number) => {
        // seekTo takes seconds in expo-audio
        player.seekTo(positionMillis / 1000);
    };

    const stopAndClearAudio = () => {
        player.pause();
        player.seekTo(0);
        setCurrentPoiId(null);
        setCurrentAudioUrl(null);
    };

    return (
        <AudioContext.Provider
            value={{
                currentPoiId,
                currentAudioUrl,
                isPlaying: status.playing,
                position: status.currentTime * 1000, // convert back to ms for UI
                duration: status.duration * 1000,
                playGlobalAudio,
                pauseGlobalAudio,
                resumeGlobalAudio,
                seekGlobalAudio,
                stopAndClearAudio,
            }}
        >
            {children}
        </AudioContext.Provider>
    );
}

export function useGlobalAudio() {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useGlobalAudio must be used within an AudioProvider');
    }
    return context;
}
