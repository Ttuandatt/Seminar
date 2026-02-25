import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { Play, Pause } from 'lucide-react-native';
import { getMediaUrl } from '../services/api';

export default function AudioPlayer({ audioUrl, autoPlay = false }: { audioUrl: string; autoPlay?: boolean }) {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);

    // Initial autoplay
    useEffect(() => {
        if (autoPlay && audioUrl) {
            // Give it a tiny delay to ensure component is mounted and ready
            const timer = setTimeout(() => {
                if (!sound && !isPlaying) {
                    playPause();
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [autoPlay, audioUrl]);

    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    const loadSound = async () => {
        try {
            if (!audioUrl) return;
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
            });

            const fullUrl = getMediaUrl(audioUrl);
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: fullUrl },
                { shouldPlay: false },
                onPlaybackStatusUpdate
            );
            setSound(newSound);
        } catch (error) {
            console.error("Error loading audio:", error);
        }
    };

    const onPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis || 0);
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
                setIsPlaying(false);
                if (sound) sound.setPositionAsync(0);
            }
        }
    };

    const playPause = async () => {
        if (!sound) {
            await loadSound();
        }

        if (sound) {
            if (isPlaying) {
                await sound.pauseAsync();
            } else {
                await sound.playAsync();
            }
        } else {
            // If sound hasn't loaded but play is pressed, try loading and playing
            try {
                if (!audioUrl) return;
                const fullUrl = getMediaUrl(audioUrl);
                const { sound: freshSound } = await Audio.Sound.createAsync(
                    { uri: fullUrl },
                    { shouldPlay: true },
                    onPlaybackStatusUpdate
                );
                setSound(freshSound);
            } catch (e) { }
        }
    };

    const formatTime = (millis: number) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    if (!audioUrl) return null;

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.playButton} onPress={playPause}>
                {isPlaying ? <Pause size={24} color="#fff" /> : <Play size={24} color="#fff" />}
            </TouchableOpacity>

            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: duration > 0 ? `${(position / duration) * 100}%` : '0%' }
                        ]}
                    />
                </View>
                <View style={styles.timeRow}>
                    <Text style={styles.timeText}>{formatTime(position)}</Text>
                    <Text style={styles.timeText}>{formatTime(duration)}</Text>
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
