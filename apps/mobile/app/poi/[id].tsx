import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { publicService, Poi } from '../../services/publicService';
import { getOfflinePoi } from '../../services/database';
import AudioPlayer from '../../components/AudioPlayer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { touristService } from '../../services/touristService';
import { getMediaUrl } from '../../services/api';
import PoiLanguageSelector from '../components/PoiLanguageSelector';
import { usePoiLocalization } from '../hooks/usePoiLocalization';
import { getLocalizationCopy } from '../services/localizationCopy';

const { width } = Dimensions.get('window');

export default function PoiDetailScreen() {
    const { id, offline } = useLocalSearchParams();
    const router = useRouter();

    const [poi, setPoi] = useState<Poi | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isUsingCachedPoi, setIsUsingCachedPoi] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const poiId = typeof id === 'string' ? id : '';

    const {
        availableLanguages,
        activeLanguage,
        setLanguage,
        getContent,
        isPending,
        requestTranslation,
        getStatusesForLanguage,
        staleNotice,
    } = usePoiLocalization(poiId, poi, {
        isRefreshing,
        isUsingCachedPoi,
    });

    useEffect(() => {
        fetchData();
        checkAuth();
    }, [poiId]);

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
        if (!poiId) {
            setLoading(false);
            return;
        }

        setIsRefreshing(true);

        try {
            if (offline === 'true') {
                const localData = getOfflinePoi(poiId);
                if (localData) {
                    setPoi({
                        ...localData,
                        media: [],
                    } as Poi);
                    setIsUsingCachedPoi(true);
                    setLoading(false);
                    return;
                }
            }

            const data = await publicService.getPoiDetail(poiId);
            setPoi(data);
            setIsUsingCachedPoi(false);

            if (isLoggedIn) {
                touristService.addHistory({ poiId: data.id, triggerType: 'MANUAL' }).catch(() => {});
            } else {
                publicService
                    .logTrigger({
                        deviceId: 'anonymous',
                        poiId: data.id,
                        triggerType: 'MANUAL',
                        userAction: 'VIEW',
                    })
                    .catch(() => {});
            }
        } catch (error) {
            console.error('Error fetching POI details:', error);
        } finally {
            setIsRefreshing(false);
            setLoading(false);
        }
    };

    const toggleFavorite = async () => {
        if (!isLoggedIn) {
            alert('Please log in to add favorites');
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
                <Text style={styles.errorText}>POI not found</Text>
            </View>
        );
    }

    const content = getContent(activeLanguage);
    const pendingForActiveLanguage = isPending(activeLanguage);
    const shouldShowRequestCta = !content.hasTranslation;
    const statusByLanguage = availableLanguages.reduce<Record<string, string[]>>((result, language) => {
        result[language.code] = getStatusesForLanguage(language.code);
        return result;
    }, {});

    const images = poi.media?.filter(m => m.type === 'IMAGE') || [];
    const audio = poi.media?.find(
        (m) => m.type === 'AUDIO' && (m.language === content.fallbackLanguage || m.language === 'ALL'),
    )
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
                        <Text style={styles.placeholderText}>NO IMAGE</Text>
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
                    <Text style={styles.title}>{content.name || poi.nameVi}</Text>
                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={styles.iconButton} onPress={toggleFavorite}>
                            <Heart size={24} color={isFavorite ? '#ef4444' : '#64748b'} fill={isFavorite ? '#ef4444' : 'transparent'} />
                        </TouchableOpacity>
                    </View>
                </View>

                <PoiLanguageSelector
                    activeLanguage={activeLanguage}
                    languages={availableLanguages.map((item) => ({ code: item.code, label: item.label }))}
                    statusByLanguage={statusByLanguage}
                    onSelectLanguage={setLanguage}
                />

                {staleNotice ? <Text style={styles.staleNotice}>{staleNotice}</Text> : null}

                <Text style={styles.typeText}>
                    {poi.category === 'CULTURAL_LANDMARKS' ? '📍 Di tích văn hóa' :
                     poi.category === 'DINING' ? '🍽️ Ăn uống' :
                     poi.category === 'CAFES_DESSERTS' ? '☕ Cà phê & tráng miệng' :
                     poi.category === 'STREET_FOOD' ? '🥢 Ẩm thực đường phố' :
                     poi.category === 'BARS_NIGHTLIFE' ? '🍸 Bar & giải trí đêm' :
                     poi.category === 'MARKETS_SPECIALTY' ? '🛒 Chợ & đặc sản' :
                     poi.category === 'EXPERIENCES_WORKSHOPS' ? '🎨 Trải nghiệm' :
                     poi.category === 'OUTDOOR_SCENIC' ? '🌿 Ngoài trời' : '📍 Điểm tham quan'}
                </Text>

                {/* Audio Player Component */}
                {audio && <AudioPlayer audioUrl={getMediaUrl(audio.url)} poiId={poi.id} />}
                {!audio && <Text style={styles.noAudioText}>No audio guide available for this language.</Text>}

                <View style={styles.descriptionCard}>
                    <Text style={styles.descriptionTitle}>About</Text>
                    {content.hasDisplayableContent ? (
                        <>
                            {content.fallbackNote ? (
                                <Text style={styles.fallbackNote}>{content.fallbackNote}</Text>
                            ) : null}
                            {pendingForActiveLanguage ? (
                                <View style={styles.pendingRow}>
                                    <Text style={styles.pendingBadge}>Pending</Text>
                                    <Text style={styles.pendingText}>{getLocalizationCopy('ws4.pending.note')}</Text>
                                </View>
                            ) : null}
                            <Text style={styles.description}>{content.description}</Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.emptyTitle}>{getLocalizationCopy('ws4.empty.title')}</Text>
                            <Text style={styles.emptyBody}>{getLocalizationCopy('ws4.empty.body')}</Text>
                        </>
                    )}

                    {shouldShowRequestCta ? (
                        <TouchableOpacity
                            style={[
                                styles.requestButton,
                                pendingForActiveLanguage && styles.requestButtonDisabled,
                            ]}
                            disabled={pendingForActiveLanguage}
                            onPress={() => requestTranslation(activeLanguage)}
                        >
                            <Text
                                style={[
                                    styles.requestButtonText,
                                    pendingForActiveLanguage && styles.requestButtonTextDisabled,
                                ]}
                            >
                                {getLocalizationCopy('ws4.request.cta')}
                            </Text>
                        </TouchableOpacity>
                    ) : null}
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
    staleNotice: {
        marginBottom: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#fff7ed',
        color: '#9a3412',
        fontSize: 12,
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
    fallbackNote: {
        marginBottom: 8,
        fontSize: 12,
        color: '#9a3412',
    },
    pendingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    pendingBadge: {
        borderRadius: 999,
        backgroundColor: '#fef3c7',
        color: '#92400e',
        fontSize: 11,
        fontWeight: '700',
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    pendingText: {
        fontSize: 12,
        color: '#92400e',
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        color: '#334155',
    },
    emptyTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 6,
    },
    emptyBody: {
        fontSize: 14,
        lineHeight: 22,
        color: '#475569',
    },
    requestButton: {
        marginTop: 14,
        borderRadius: 10,
        backgroundColor: '#0C4A6E',
        paddingVertical: 10,
        alignItems: 'center',
    },
    requestButtonDisabled: {
        backgroundColor: '#cbd5e1',
    },
    requestButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
    },
    requestButtonTextDisabled: {
        color: '#64748b',
    },
});
