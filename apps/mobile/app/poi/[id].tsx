import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Heart, Globe } from 'lucide-react-native';
import { publicService, Poi } from '../../services/publicService';
import AudioPlayer from '../../components/AudioPlayer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { touristService } from '../../services/touristService';

const { width } = Dimensions.get('window');

export default function PoiDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [poi, setPoi] = useState<Poi | null>(null);
    const [loading, setLoading] = useState(true);
    const [lang, setLang] = useState<'vi' | 'en'>('vi');
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

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

    const toggleLanguage = () => {
        setLang(prev => prev === 'vi' ? 'en' : 'vi');
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
                <ActivityIndicator size="large" color="#0f172a" />
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

    const images = poi.media?.filter(m => m.type === 'IMAGE') || [];
    const audio = poi.media?.find(m => m.type === 'AUDIO' && m.language === lang.toUpperCase());

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Image Carousel */}
            <View style={styles.carouselContainer}>
                {images.length > 0 ? (
                    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                        {images.map((img, index) => (
                            <Image
                                key={img.id || index}
                                source={{ uri: img.url }}
                                style={styles.carouselImage}
                            />
                        ))}
                    </ScrollView>
                ) : (
                    <View style={[styles.carouselImage, styles.placeholderImage]}>
                        <Text style={styles.placeholderText}>NO IMAGE</Text>
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>
                        {lang === 'vi' ? poi.nameVi : (poi.nameEn || poi.nameVi)}
                    </Text>
                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={styles.iconButton} onPress={toggleLanguage}>
                            <Globe size={24} color="#64748b" />
                            <Text style={styles.langText}>{lang.toUpperCase()}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={toggleFavorite}>
                            <Heart size={24} color={isFavorite ? '#ef4444' : '#64748b'} fill={isFavorite ? '#ef4444' : 'transparent'} />
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.typeText}>
                    {poi.poiType === 'MAIN' ? '📍 Cột mốc chính' : '🛎️ Điểm lân cận'}
                </Text>

                {/* Audio Player Component */}
                {audio && <AudioPlayer audioUrl={audio.url} />}
                {!audio && <Text style={styles.noAudioText}>No audio guide available for this language.</Text>}

                <View style={styles.descriptionCard}>
                    <Text style={styles.descriptionTitle}>About</Text>
                    <Text style={styles.description}>
                        {lang === 'vi' ? poi.descriptionVi : (poi.descriptionEn || poi.descriptionVi)}
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
        height: 250,
    },
    carouselImage: {
        width: width,
        height: 250,
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
