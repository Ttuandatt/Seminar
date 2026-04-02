import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { publicService, Poi } from '../../services/publicService';
import { LocateFixed, Layers, ChevronRight, MapPin } from 'lucide-react-native';
import { getDistance } from '../../utils/distance';
import AudioPlayer from '../../components/AudioPlayer';
import { getMediaUrl } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { organicMapStyle } from '../../utils/mapStyle';
import { useLanguage } from '../../context/LanguageContext';

const { width } = Dimensions.get('window');
const VINH_KHANH_REGION = {
    latitude: 10.7553,
    longitude: 106.6965,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
};

type NearbyPoi = Poi & { distanceM: number };

export default function MapScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { lang, getPoiName } = useLanguage();
    const mapRef = useRef<MapView>(null);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [pois, setPois] = useState<Poi[]>([]);
    const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
    const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);

    // Queue: POIs currently within trigger radius, sorted by distance
    const [nearbyQueue, setNearbyQueue] = useState<NearbyPoi[]>([]);
    // Manual selection (tap on marker when not in range)
    const [manualSelectedPoi, setManualSelectedPoi] = useState<Poi | null>(null);

    useEffect(() => {
        const loadSettings = async () => {
            const autoPlay = await AsyncStorage.getItem('autoPlayAudio');
            if (autoPlay !== null) setAutoPlayEnabled(autoPlay === 'true');
        };
        loadSettings();
    }, []);

    useEffect(() => {
        let locationSubscription: Location.LocationSubscription | null = null;

        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            let initLoc = await Location.getCurrentPositionAsync({});
            setLocation(initLoc);

            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 2000,
                    distanceInterval: 5,
                },
                (newLocation) => {
                    setLocation(newLocation);

                    if (pois.length > 0) {
                        const inRange: NearbyPoi[] = [];

                        for (const poi of pois) {
                            const dist = getDistance(
                                { latitude: newLocation.coords.latitude, longitude: newLocation.coords.longitude },
                                { latitude: Number(poi.latitude), longitude: Number(poi.longitude) }
                            );
                            const radius = poi.triggerRadius || 50;

                            if (dist <= radius) {
                                inRange.push({ ...poi, distanceM: dist });
                            }
                        }

                        // Sort by distance (closest first = highest priority)
                        inRange.sort((a, b) => a.distanceM - b.distanceM);
                        setNearbyQueue(inRange);

                        // Clear manual selection if user is in range of POIs
                        if (inRange.length > 0) {
                            setManualSelectedPoi(null);
                        }
                    }
                }
            );
        })();

        return () => {
            if (locationSubscription) locationSubscription.remove();
        };
    }, [pois]);

    const fetchPois = useCallback(async () => {
        try {
            const data = await publicService.getAllPois();
            console.log('[Map] fetched POIs:', data.length);
            data.forEach(p => console.log(`[Map] POI: ${p.nameVi} | radius=${p.triggerRadius}m | media=${p.media?.length}`));
            setPois(data);
        } catch (error) {
            console.error('[Map] fetchPois error:', error);
        }
    }, []);

    useEffect(() => { fetchPois(); }, [fetchPois]);
    useFocusEffect(useCallback(() => { fetchPois(); }, [fetchPois]));

    const handleMarkerPress = (poi: Poi) => {
        // Always switch to tapped POI — clear queue view and show this POI
        setNearbyQueue([]);
        setManualSelectedPoi(poi);
    };

    const goToUserLocation = async () => {
        try {
            let loc = await Location.getLastKnownPositionAsync({});
            if (!loc) loc = await Location.getCurrentPositionAsync({});
            if (loc) {
                setLocation(loc);
                mapRef.current?.animateToRegion({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                }, 1000);
            }
        } catch (error) {
            console.error("Error getting location: ", error);
        }
    };

    const toggleMapType = () => {
        setMapType(prev => prev === 'standard' ? 'satellite' : 'standard');
    };

    // Helper: get audio for a POI in current language
    const getAudioForPoi = (poi: Poi) => {
        return poi.media?.find(m => m.type === 'AUDIO' && (m.language === lang.toUpperCase() || m.language === 'ALL'))
            ?? poi.media?.find(m => m.type === 'AUDIO');
    };

    const getImageForPoi = (poi: Poi) => {
        return poi.media?.find(m => m.type === 'IMAGE');
    };

    const formatDistance = (meters: number) => {
        return meters < 1000 ? `${Math.round(meters)}m` : `${(meters / 1000).toFixed(1)}km`;
    };

    const hasQueue = nearbyQueue.length > 0;
    const hasManual = !hasQueue && manualSelectedPoi !== null;
    const showBottomSheet = hasQueue || hasManual;

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                mapType={mapType}
                initialRegion={VINH_KHANH_REGION}
                showsUserLocation
                showsMyLocationButton={false}
                customMapStyle={organicMapStyle}
            >
                {/* User range circle */}
                {location && (
                    <Circle
                        center={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        }}
                        radius={50}
                        fillColor="rgba(249, 115, 22, 0.12)"
                        strokeColor="rgba(249, 115, 22, 0.4)"
                        strokeWidth={1.5}
                        zIndex={1}
                    />
                )}

                {/* POI trigger radius circles */}
                {pois.map((poi) => (
                    <Circle
                        key={`circle-${poi.id}`}
                        center={{ latitude: Number(poi.latitude), longitude: Number(poi.longitude) }}
                        radius={poi.triggerRadius || 50}
                        fillColor={nearbyQueue.some(p => p.id === poi.id)
                            ? "rgba(12, 74, 110, 0.15)"
                            : "rgba(12, 74, 110, 0.06)"}
                        strokeColor={nearbyQueue.some(p => p.id === poi.id)
                            ? "rgba(12, 74, 110, 0.5)"
                            : "rgba(12, 74, 110, 0.2)"}
                        strokeWidth={1}
                        zIndex={0}
                    />
                ))}

                {/* POI markers */}
                {pois.map((poi) => (
                    <Marker
                        key={poi.id}
                        coordinate={{ latitude: Number(poi.latitude), longitude: Number(poi.longitude) }}
                        title={getPoiName(poi)}
                        description={poi.category}
                        pinColor={poi.category === 'CULTURAL_LANDMARKS' ? '#EF4444' : '#F97316'}
                        tracksViewChanges={false}
                        onPress={() => handleMarkerPress(poi)}
                    />
                ))}
            </MapView>

            <View style={[styles.mapControls, { bottom: showBottomSheet ? 280 : 120 }]}>
                <TouchableOpacity style={styles.controlButton} onPress={toggleMapType}>
                    <Layers size={24} color={mapType === 'satellite' ? '#F97316' : '#0f172a'} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.controlButton, { marginTop: 12 }]} onPress={goToUserLocation}>
                    <LocateFixed size={24} color="#0f172a" />
                </TouchableOpacity>
            </View>

            {/* ===== AUDIO QUEUE BOTTOM SHEET ===== */}
            {hasQueue && (
                <View style={styles.queueSheet}>
                    <View style={styles.queueHeader}>
                        <View style={styles.queueBadge}>
                            <MapPin size={14} color="#fff" />
                        </View>
                        <Text style={styles.queueTitle}>
                            {t('map.nearbyPois', { count: nearbyQueue.length })}
                        </Text>
                        <TouchableOpacity onPress={() => setNearbyQueue([])}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.queueList}
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={false}
                    >
                        {nearbyQueue.map((poi, index) => {
                            const imageMedia = getImageForPoi(poi);
                            const audioMedia = getAudioForPoi(poi);
                            const isFirst = index === 0;

                            return (
                                <View key={poi.id} style={[styles.queueItem, isFirst && styles.queueItemActive]}>
                                    <View style={styles.queueItemRow}>
                                        <View style={styles.priorityBadge}>
                                            <Text style={styles.priorityText}>{index + 1}</Text>
                                        </View>
                                        <Image
                                            source={{ uri: imageMedia ? getMediaUrl(imageMedia.url) : 'https://via.placeholder.com/60' }}
                                            style={styles.queueImage}
                                        />
                                        <View style={styles.queueItemInfo}>
                                            <Text style={styles.queueItemName} numberOfLines={1}>{getPoiName(poi)}</Text>
                                            <Text style={styles.queueItemMeta}>
                                                {t(`categories.${poi.category}`, t('categories.DEFAULT'))}
                                                {' • '}{formatDistance(poi.distanceM)}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.queueDetailBtn}
                                            onPress={() => router.push(`/poi/${poi.id}`)}
                                        >
                                            <ChevronRight size={18} color="#64748B" />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Audio player for every POI in queue */}
                                    {audioMedia?.url && (
                                        <View style={styles.queueAudio}>
                                            <AudioPlayer
                                                audioUrl={getMediaUrl(audioMedia.url)}
                                                poiId={poi.id}
                                                autoPlay={isFirst && autoPlayEnabled}
                                            />
                                        </View>
                                    )}
                                    {!audioMedia && (
                                        <Text style={styles.noAudioHint}>{t('poi.noAudio')}</Text>
                                    )}
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>
            )}

            {/* ===== MANUAL SELECTION (tap marker outside range) ===== */}
            {hasManual && (() => {
                const poi = manualSelectedPoi!;
                const imageMedia = getImageForPoi(poi);
                const audioMedia = getAudioForPoi(poi);
                const distanceM = location ? getDistance(
                    { latitude: location.coords.latitude, longitude: location.coords.longitude },
                    { latitude: Number(poi.latitude), longitude: Number(poi.longitude) }
                ) : null;

                return (
                    <View style={styles.bottomSheet}>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setManualSelectedPoi(null)}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>

                        <View style={styles.poiPreviewRow}>
                            <Image
                                source={{ uri: imageMedia ? getMediaUrl(imageMedia.url) : 'https://via.placeholder.com/150' }}
                                style={styles.poiImage}
                            />
                            <View style={styles.poiInfo}>
                                <Text style={styles.poiTitle} numberOfLines={1}>{getPoiName(poi)}</Text>
                                <Text style={styles.poiType}>
                                    {t(`categories.${poi.category}`, t('categories.DEFAULT'))}
                                    {distanceM !== null && ` • ${formatDistance(distanceM)}`}
                                </Text>
                                <TouchableOpacity
                                    style={styles.detailButton}
                                    onPress={() => router.push(`/poi/${poi.id}`)}
                                >
                                    <Text style={styles.detailButtonText}>{t('map.viewDetails')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {audioMedia?.url && (
                            <View style={styles.audioWrapper}>
                                <AudioPlayer audioUrl={getMediaUrl(audioMedia.url)} poiId={poi.id} autoPlay={false} />
                            </View>
                        )}
                    </View>
                );
            })()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { width: '100%', height: '100%' },
    mapControls: {
        position: 'absolute',
        right: 16,
        zIndex: 2,
    },
    controlButton: {
        backgroundColor: '#ffffff',
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#0C4A6E',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },

    /* ===== Queue Sheet ===== */
    queueSheet: {
        position: 'absolute',
        bottom: 100,
        left: 12,
        right: 12,
        maxHeight: 320,
        backgroundColor: 'rgba(255, 255, 255, 0.97)',
        borderRadius: 24,
        padding: 16,
        shadowColor: '#0C4A6E',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    queueHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    queueBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#0C4A6E',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    queueTitle: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    queueList: {
        maxHeight: 240,
    },
    queueItem: {
        marginBottom: 10,
        borderRadius: 16,
        backgroundColor: '#F8FAFC',
        padding: 12,
    },
    queueItemActive: {
        backgroundColor: '#F0F9FF',
        borderWidth: 1,
        borderColor: '#BAE6FD',
    },
    queueItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priorityBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F97316',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    priorityText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    queueImage: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#E2E8F0',
    },
    queueItemInfo: {
        flex: 1,
        marginLeft: 10,
    },
    queueItemName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    queueItemMeta: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    queueDetailBtn: {
        padding: 8,
    },
    queueAudio: {
        marginTop: 8,
    },
    noAudioHint: {
        marginTop: 8,
        fontSize: 12,
        color: '#94A3B8',
        fontStyle: 'italic',
    },

    /* ===== Manual Selection Sheet (old style) ===== */
    bottomSheet: {
        position: 'absolute',
        bottom: 100,
        left: 16,
        right: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#0C4A6E',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    poiPreviewRow: { flexDirection: 'row' },
    audioWrapper: { marginTop: 8 },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 1,
        backgroundColor: '#F1F5F9',
        borderRadius: 16,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#64748B',
    },
    poiImage: {
        width: 88,
        height: 88,
        borderRadius: 16,
        backgroundColor: '#E2E8F0',
    },
    poiInfo: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'space-between',
    },
    poiTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginRight: 24,
    },
    poiType: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
        fontWeight: '500',
    },
    detailButton: {
        backgroundColor: '#F97316',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 12,
    },
    detailButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
});
