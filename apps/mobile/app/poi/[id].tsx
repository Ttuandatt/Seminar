import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Heart, Globe } from 'lucide-react-native';
import { publicService, Poi } from '../../services/publicService';
import { OfflineDataLayer } from '../../services/offlineDataLayer';
import AudioPlayer from '../../components/AudioPlayer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { touristService } from '../../services/touristService';
import { getMediaUrl } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { translateTextRuntime } from '../../services/runtimeLocalizationService';
import { usePoiLocalization } from '../../hooks/usePoiLocalization';
import { getFallbackAudioLabel, getFallbackTextNote, getLanguageLabel, getMissingAudioNote, getNoAudioAvailableNote } from '../../services/localizationCopy';

const { width } = Dimensions.get('window');

export default function PoiDetailScreen() {
    const { id, offline } = useLocalSearchParams();
    const router = useRouter();
    const { t } = useTranslation();
    const { lang, getPoiName, getPoiDescription } = useLanguage();

    const [poi, setPoi] = useState<Poi | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [translatedName, setTranslatedName] = useState<string | null>(null);
    const [translatedDescription, setTranslatedDescription] = useState<string | null>(null);
    const [selectedAudioUrl, setSelectedAudioUrl] = useState<string | null>(null);

    const shouldUseRuntimeLocalization = lang !== 'vi' && lang !== 'en';
    const { textState, audioState } = usePoiLocalization(poi, translatedName, translatedDescription);

    useEffect(() => {
        fetchData();
        checkAuth();
    }, [id]);

    useEffect(() => {
        let cancelled = false;

        const translatePoiContent = async () => {
            if (!poi || !shouldUseRuntimeLocalization) {
                setTranslatedName(null);
                setTranslatedDescription(null);
                return;
            }

            const sourceName = poi.nameEn || poi.nameVi || '';
            const sourceDescription = poi.descriptionEn || poi.descriptionVi || '';

            try {
                const [nameResult, descriptionResult] = await Promise.all([
                    translateTextRuntime(sourceName, 'auto', lang),
                    translateTextRuntime(sourceDescription, 'auto', lang),
                ]);

                if (!cancelled) {
                    setTranslatedName(nameResult);
                    setTranslatedDescription(descriptionResult);
                }
            } catch (error) {
                if (!cancelled) {
                    setTranslatedName(null);
                    setTranslatedDescription(null);
                }
                console.warn('Runtime localization failed:', error);
            }
        };

        translatePoiContent();

        return () => {
            cancelled = true;
        };
    }, [poi, lang, shouldUseRuntimeLocalization]);

    useEffect(() => {
        if (!audioState) {
            setSelectedAudioUrl(null);
            return;
        }

        setSelectedAudioUrl(audioState.exactAudioUrl ? getMediaUrl(audioState.exactAudioUrl) : null);
    }, [audioState?.exactAudioUrl, audioState?.requestedLanguage]);

    const checkAuth = async () => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
            setIsLoggedIn(true);
            // Optional: fetch favorites to check if this POI is favorited
            try {
                const favs = await touristService.getFavorites();
                if (favs.some((f: any) => f.poiId === id)) {
                    setIsFavorite(true);
                }
            } catch (error) {
                console.warn('Failed to load favorites:', error);
            }
        }
    };

    const fetchData = async () => {
        try {
            if (typeof id === 'string') {
                const data = await OfflineDataLayer.getPoi(id);
                setPoi(data);

                // Log view history
                if (isLoggedIn) {
                    touristService.addHistory({ poiId: data.id, triggerType: 'MANUAL' }).catch(() => { });
                } else {
                    publicService.logTrigger({ deviceId: 'anonymous', poiId: data.id, triggerType: 'MANUAL', userAction: 'VIEW' }).catch(() => { });
                }
            }
        } catch (error) {
            console.error('Error fetching POI details:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async () => {
        if (!isLoggedIn) {
            alert(t('poi.loginToFavorite'));
            return;
        }
        try {
            if (isFavorite) {
                await touristService.removeFavorite(poi!.id);
                setIsFavorite(false);
            } else {
                await touristService.addFavorite(poi!.id);
                setIsFavorite(true);
            }
        } catch (error) {
            console.error('Toggle favorite failed:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#F97316" />
            </View>
        );
    }

    if (!poi) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{t('poi.notFound')}</Text>
            </View>
        );
    }

    const images = poi.media?.filter(m => m.type === 'IMAGE') || [];
    const displayName = textState?.name || getPoiName(poi);
    const displayDescription = textState?.description || getPoiDescription(poi);
    const fallbackTextNote = textState ? getFallbackTextNote(textState.resolvedLanguage, textState.requestedLanguage) : '';
    const exactAudioUrl = audioState?.exactAudioUrl ? getMediaUrl(audioState.exactAudioUrl) : null;
    const activeAudioUrl = selectedAudioUrl || exactAudioUrl;
    const exactAudioMissingNote = audioState ? getMissingAudioNote(audioState.requestedLanguage) : '';
    const audioUnavailableNote = audioState?.isUnavailable ? getNoAudioAvailableNote() : '';

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Image Carousel */}
            <View style={styles.carouselContainer}>
                {images.length > 0 ? (
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
                            const index = Math.round(e.nativeEvent.contentOffset.x / width);
                            setActiveImageIndex(index);
                        }}
                        scrollEventThrottle={16}
                    >
                        {images.map((img) => (
                            <Image
                                key={img.id || img.url || img.originalName || img.type}
                                source={{ uri: getMediaUrl(img.url) }}
                                style={styles.carouselImage}
                            />
                        ))}
                    </ScrollView>
                ) : (
                    <View style={[styles.carouselImage, styles.placeholderImage]}>
                        <Text style={styles.placeholderText}>{t('poi.noImage')}</Text>
                    </View>
                )}
                {images.length > 1 && (
                    <View style={styles.dotsContainer}>
                        {images.map((img, i) => (
                            <View
                                key={img.id || img.url || img.originalName || img.type}
                                style={[
                                    styles.dot,
                                    i === activeImageIndex && styles.dotActive,
                                ]}
                            />
                        ))}
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>
                        {displayName}
                    </Text>
                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/language')}>
                            <Globe size={24} color="#64748b" />
                            <Text style={styles.langText}>{lang.toUpperCase()}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={toggleFavorite}>
                            <Heart size={24} color={isFavorite ? '#ef4444' : '#64748b'} fill={isFavorite ? '#ef4444' : 'transparent'} />
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.typeText}>
                    {t(`categories.${poi.category}`, t('categories.DEFAULT'))}
                </Text>

                {fallbackTextNote ? (
                    <View style={styles.fallbackNoteCard}>
                        <Text style={styles.fallbackNoteText}>{fallbackTextNote}</Text>
                    </View>
                ) : null}

                {audioState && (
                    <View style={styles.audioListCard}>
                        <Text style={styles.audioListTitle}>{t('poi.availableAudio') || 'Available audio'}</Text>

                        {audioState.availableLanguages.length > 0 && (
                            <View style={styles.audioLanguageRow}>
                                {audioState.availableLanguages.map((language) => (
                                    <View key={language} style={styles.audioLanguageChip}>
                                        <Text style={styles.audioLanguageChipText}>{getLanguageLabel(language)}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {!audioState.exactLanguageAvailable && (
                            <View style={styles.audioUnavailableCard}>
                                <Text style={styles.audioUnavailableText}>
                                    {audioUnavailableNote || exactAudioMissingNote}
                                </Text>
                            </View>
                        )}

                        {activeAudioUrl && (
                            <View style={styles.audioPlayerWrap}>
                                <AudioPlayer
                                    audioUrl={activeAudioUrl}
                                    poiId={poi.id}
                                    autoPlay={Boolean(activeAudioUrl)}
                                />
                            </View>
                        )}

                        <View style={styles.audioListWrap}>
                            {audioState.fallbackOptions.map((option) => {
                                const resolvedUrl = getMediaUrl(option.url);
                                const isActive = activeAudioUrl === resolvedUrl;

                                return (
                                    <TouchableOpacity
                                        key={option.language || option.url}
                                        style={[styles.audioPill, isActive && styles.audioPillActive]}
                                        onPress={() => setSelectedAudioUrl(resolvedUrl)}
                                    >
                                        <Text style={[styles.audioPillText, isActive && styles.audioPillTextActive]}>
                                            {getFallbackAudioLabel(option.language)}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}

                <View style={styles.descriptionCard}>
                    <Text style={styles.descriptionTitle}>{t('poi.about')}</Text>
                    <Text style={styles.description}>
                        {displayDescription}
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        color: '#ef4444',
    },
    carouselContainer: {
        height: 280,
    },
    carouselImage: {
        width: width,
        height: 280,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 12,
        left: 0,
        right: 0,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginHorizontal: 4,
    },
    dotActive: {
        backgroundColor: '#F97316',
        width: 20,
    },
    placeholderImage: {
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#94a3b8',
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
        flex: 1,
        marginRight: 16,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconButton: {
        alignItems: 'center',
    },
    langText: {
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 2,
        color: '#64748b',
    },
    typeText: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 8,
        marginBottom: 8,
    },
    noAudioText: {
        fontStyle: 'italic',
        color: '#94a3b8',
        marginVertical: 16,
    },
    fallbackNoteCard: {
        backgroundColor: '#eff6ff',
        borderRadius: 12,
        padding: 12,
        marginTop: 12,
    },
    fallbackNoteText: {
        fontSize: 13,
        lineHeight: 20,
        color: '#1d4ed8',
        fontWeight: '500',
    },
    audioListCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        marginTop: 12,
    },
    audioListTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 12,
    },
    audioLanguageRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    audioLanguageChip: {
        borderRadius: 999,
        backgroundColor: '#e2e8f0',
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    audioLanguageChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#334155',
    },
    audioPlayerWrap: {
        marginBottom: 12,
    },
    audioUnavailableCard: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f1c40f33',
        backgroundColor: '#fffbeb',
        padding: 12,
        marginBottom: 12,
    },
    audioUnavailableText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#92400e',
        marginBottom: 4,
    },
    audioUnavailableHint: {
        fontSize: 13,
        color: '#b45309',
        lineHeight: 18,
    },
    audioListWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    audioPill: {
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    audioPillActive: {
        backgroundColor: '#0f172a',
        borderColor: '#0f172a',
    },
    audioPillText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#334155',
    },
    audioPillTextActive: {
        color: '#fff',
    },
    descriptionCard: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
    },
    descriptionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        color: '#334155',
    },
});
