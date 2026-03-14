import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { publicService, Poi } from '../../services/publicService';
import { LocateFixed, Layers } from 'lucide-react-native';
import { getDistance } from '../../utils/distance';
import AudioPlayer from '../../components/AudioPlayer';
import { getMediaUrl } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { organicMapStyle } from '../../utils/mapStyle';

const { width } = Dimensions.get('window');
const VINH_KHANH_REGION = {
    latitude: 10.7553,
    longitude: 106.6965,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
};

export default function MapScreen() {
    const router = useRouter();
    const mapRef = useRef<MapView>(null);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [pois, setPois] = useState<Poi[]>([]);
    const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
    const [lang, setLang] = useState<'vi' | 'en'>('vi');
    const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
    const [userMarkerReady, setUserMarkerReady] = useState(false);
    const triggeredPoiIds = useRef<Set<string>>(new Set());

    useEffect(() => {
        const loadLang = async () => {
            const savedLang = await AsyncStorage.getItem('appLanguage');
            if (savedLang === 'en' || savedLang === 'vi') setLang(savedLang);
            const autoPlay = await AsyncStorage.getItem('autoPlayAudio');
            if (autoPlay !== null) setAutoPlayEnabled(autoPlay === 'true');
        };
        loadLang();
    }, []);

    useEffect(() => {
        let locationSubscription: Location.LocationSubscription | null = null;

        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            // Quick initial location
            let initLoc = await Location.getCurrentPositionAsync({});
            setLocation(initLoc);

            // Continuous background tracking for auto-trigger
            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 2000,
                    distanceInterval: 5, // update every 5 meters
                },
                (newLocation) => {
                    setLocation(newLocation);

                    // Check for nearby POIs
                    if (pois.length > 0) {
                        for (const poi of pois) {
                            const dist = getDistance(
                                { latitude: newLocation.coords.latitude, longitude: newLocation.coords.longitude },
                                { latitude: Number(poi.latitude), longitude: Number(poi.longitude) }
                            );

                            const radius = poi.triggerRadius || 50; // default 50m

                            if (dist <= radius) {
                                // Inside trigger radius
                                if (!triggeredPoiIds.current.has(poi.id)) {
                                    triggeredPoiIds.current.add(poi.id);

                                    // Auto-trigger (open bottom sheet) if user isn't already viewing one
                                    setSelectedPoi(current => {
                                        if (!current) {
                                            return poi;
                                        }
                                        return current;
                                    });
                                }
                            } else {
                                // Walked out of radius, reset so it can trigger again next time
                                if (triggeredPoiIds.current.has(poi.id)) {
                                    triggeredPoiIds.current.delete(poi.id);
                                }
                            }
                        }
                    }
                }
            );
        })();

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, [pois]); // Re-subscribe if POIs list changes

    useEffect(() => {
        fetchPois();
    }, []);

    const fetchPois = async () => {
        try {
            const data = await publicService.getAllPois();
            setPois(data);
        } catch (error) {
            console.error('Error fetching POIs:', error);
        }
    };

    const handleMarkerPress = (poi: Poi) => {
        setSelectedPoi(poi);
    };

    const goToUserLocation = async () => {
        try {
            let loc = await Location.getLastKnownPositionAsync({});
            if (!loc) {
                loc = await Location.getCurrentPositionAsync({});
            }
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

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                mapType={mapType}
                initialRegion={VINH_KHANH_REGION}
                showsMyLocationButton={false}
                customMapStyle={organicMapStyle}
            >
                {/* User location marker — works in both Expo Go and APK */}
                {location && (
                    <>
                        <Circle
                            center={{
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                            }}
                            radius={20}
                            fillColor="rgba(12, 74, 110, 0.15)"
                            strokeColor="rgba(12, 74, 110, 0.3)"
                            strokeWidth={1}
                        />
                        <Marker
                            coordinate={{
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                            }}
                            anchor={{ x: 0.5, y: 0.5 }}
                            tracksViewChanges={!userMarkerReady}
                            zIndex={999}
                        >
                            <View
                                style={styles.userLocationDot}
                                onLayout={() => setUserMarkerReady(true)}
                            >
                                <View style={styles.userLocationInner} />
                            </View>
                        </Marker>
                    </>
                )}

                {pois.map((poi) => (
                    <Marker
                        key={poi.id}
                        coordinate={{ latitude: Number(poi.latitude), longitude: Number(poi.longitude) }}
                        title={poi.nameVi}
                        description={poi.poiType}
                        pinColor={poi.poiType === 'MAIN' ? 'red' : 'gold'}
                        tracksViewChanges={false}
                        onPress={() => handleMarkerPress(poi)}
                    />
                ))}
            </MapView>

            <View style={[styles.mapControls, { bottom: selectedPoi ? 260 : 120 }]}>
                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={toggleMapType}
                >
                    <Layers size={24} color={mapType === 'satellite' ? '#F97316' : '#0f172a'} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.controlButton, { marginTop: 12 }]}
                    onPress={goToUserLocation}
                >
                    <LocateFixed size={24} color="#0f172a" />
                </TouchableOpacity>
            </View>

            {selectedPoi && (() => {
                const imageMedia = selectedPoi.media?.find(m => m.type === 'IMAGE');
                const audioMedia = selectedPoi.media?.find(m => m.type === 'AUDIO' && (m.language === lang.toUpperCase() || m.language === 'ALL'));
                const distanceM = location ? getDistance(
                    { latitude: location.coords.latitude, longitude: location.coords.longitude },
                    { latitude: Number(selectedPoi.latitude), longitude: Number(selectedPoi.longitude) }
                ) : null;
                const distanceText = distanceM !== null
                    ? distanceM < 1000 ? `${Math.round(distanceM)}m` : `${(distanceM / 1000).toFixed(1)}km`
                    : null;

                return (
                    <View style={styles.bottomSheet}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setSelectedPoi(null)}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>

                        <View style={styles.poiPreviewRow}>
                            <Image
                                source={{ uri: imageMedia?.url || 'https://via.placeholder.com/150' }}
                                style={styles.poiImage}
                            />
                            <View style={styles.poiInfo}>
                                <Text style={styles.poiTitle} numberOfLines={1}>{selectedPoi.nameVi}</Text>
                                <Text style={styles.poiType}>
                                    {selectedPoi.poiType === 'MAIN' ? '📍 Cột mốc chính' : '🛎️ Điểm lân cận'}
                                    {distanceText && ` • ${distanceText}`}
                                </Text>
                                <TouchableOpacity
                                    style={styles.detailButton}
                                    onPress={() => router.push(`/poi/${selectedPoi.id}`)}
                                >
                                    <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {audioMedia?.url && (
                            <View style={styles.audioWrapper}>
                                <AudioPlayer audioUrl={audioMedia.url} poiId={selectedPoi.id} autoPlay={autoPlayEnabled} />
                            </View>
                        )}
                    </View>
                );
            })()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    userLocationDot: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#0C4A6E',
        borderWidth: 3,
        borderColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 4,
    },
    userLocationInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ffffff',
    },
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
    bottomSheet: {
        position: 'absolute',
        bottom: 100, // accommodate floating tab bar
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
    poiPreviewRow: {
        flexDirection: 'row',
    },
    audioWrapper: {
        marginTop: 8,
    },
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
