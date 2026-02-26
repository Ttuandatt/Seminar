import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Pause } from 'lucide-react-native';
import { useGlobalAudio } from '../context/AudioContext';

export default function AudioPlayer({ audioUrl, poiId, autoPlay = false }: { audioUrl: string; poiId: string; autoPlay?: boolean }) {
    const {
        currentAudioUrl,
        currentPoiId,
        isPlaying,
        position,
        duration,
        playGlobalAudio,
        pauseGlobalAudio,
        resumeGlobalAudio
    } = useGlobalAudio();

    // Determine if this specific audio is the one currently active in the global context
    const isThisAudioActive = currentAudioUrl === audioUrl && currentPoiId === poiId;

    useEffect(() => {
        if (autoPlay && audioUrl && poiId) {
            const timer = setTimeout(() => {
                // Play it globally if not already playing
                if (!isThisAudioActive || !isPlaying) {
                    playGlobalAudio(audioUrl, poiId);
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [autoPlay, audioUrl, poiId]);

    const handlePlayPause = () => {
        if (!audioUrl || !poiId) return;

        if (isThisAudioActive) {
            if (isPlaying) {
                pauseGlobalAudio();
            } else {
                resumeGlobalAudio();
            }
        } else {
            // Switching to this audio
            playGlobalAudio(audioUrl, poiId);
        }
    };

    const formatTime = (millis: number) => {
        const totalSeconds = Math.floor((millis || 0) / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    if (!audioUrl || !poiId) return null;

    // Use global position/duration only if this audio is the active one tracking
    const displayPosition = isThisAudioActive ? position : 0;
    const displayDuration = isThisAudioActive ? duration : 0;
    const displayIsPlaying = isThisAudioActive ? isPlaying : false;

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
                {displayIsPlaying ? <Pause size={24} color="#fff" /> : <Play size={24} color="#fff" />}
            </TouchableOpacity>

            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: displayDuration > 0 ? `${(displayPosition / displayDuration) * 100}%` : '0%' }
                        ]}
                    />
                </View>
                <View style={styles.timeRow}>
                    <Text style={styles.timeText}>{formatTime(displayPosition)}</Text>
                    <Text style={styles.timeText}>{formatTime(displayDuration)}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        padding: 16,
        borderRadius: 12,
        marginVertical: 16,
    },
    playButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressContainer: {
        flex: 1,
        marginLeft: 16,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#cbd5e1',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#0f172a',
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    timeText: {
        fontSize: 12,
        color: '#64748b',
        fontVariant: ['tabular-nums'],
    },
});
