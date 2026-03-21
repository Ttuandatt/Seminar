import React, { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Heart, Globe } from 'lucide-react-native';
import { publicService, Poi } from '../../services/publicService';
import { getOfflinePoi } from '../../services/database';
import AudioPlayer from '../../components/AudioPlayer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { touristService } from '../../services/touristService';
import { getMediaUrl } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';

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

    useEffect(() => {
        fetchData();
        checkAuth();
    }, [id]);

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
            } catch (e) { }
        }
    };

    const fetchData = async () => {
        try {
            if (typeof id === 'string') {
                if (offline === 'true') {
                    const localData = getOfflinePoi(id);
                    if (localData) {
                        setPoi({
                            ...localData,
                            media: [] // Offline mode has no media for now
                        } as any);
                        setLoading(false);
                        return;
                    }
                }

                const data = await publicService.getPoiDetail(id);
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
    const audio = poi.media?.find(m => m.type === 'AUDIO' && (m.language === lang.toUpperCase() || m.language === 'ALL'))
        ?? poi.media?.find(m => m.type === 'AUDIO');

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
                        {images.map((img, index) => (
                            <Image
                                key={img.id || index}
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
                        {images.map((_, i) => (
                            <View
                                key={i}
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
                        {getPoiName(poi)}
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

                {/* Audio Player Component */}
                {audio && <AudioPlayer audioUrl={getMediaUrl(audio.url)} poiId={poi.id} />}
                {!audio && <Text style={styles.noAudioText}>{t('poi.noAudio')}</Text>}

                <View style={styles.descriptionCard}>
                    <Text style={styles.descriptionTitle}>{t('poi.about')}</Text>
                    <Text style={styles.description}>
                        {getPoiDescription(poi)}
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
