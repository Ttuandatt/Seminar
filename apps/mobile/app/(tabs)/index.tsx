import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { publicService, Poi } from '../../services/publicService';
import { LocateFixed, Layers } from 'lucide-react-native';
import { getDistance } from '../../utils/distance';
import AudioPlayer from '../../components/AudioPlayer';
import { getMediaUrl } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const triggeredPoiIds = useRef<Set<string>>(new Set());

    useEffect(() => {
        const loadLang = async () => {
            const savedLang = await AsyncStorage.getItem('appLanguage');
            if (savedLang === 'en' || savedLang === 'vi') setLang(savedLang);
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
                showsUserLocation
                showsMyLocationButton={false}
            >
                {pois.map((poi) => (
                    <Marker
                        key={poi.id}
                        coordinate={{ latitude: Number(poi.latitude), longitude: Number(poi.longitude) }}
                        title={poi.nameVi}
                        description={poi.poiType}
                        pinColor={poi.poiType === 'MAIN' ? 'red' : 'gold'}
                        onPress={() => handleMarkerPress(poi)}
                    />
                ))}
            </MapView>

            <View style={[styles.mapControls, { bottom: selectedPoi ? 160 : 30 }]}>
                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={toggleMapType}
                >
                    <Layers size={24} color={mapType === 'satellite' ? '#2563eb' : '#0f172a'} />
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
                                <Text style={styles.poiType}>{selectedPoi.poiType === 'MAIN' ? 'Cột mốc chính' : 'Điểm lân cận'}</Text>
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
                                <AudioPlayer audioUrl={audioMedia.url} autoPlay={true} />
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
    mapControls: {
        position: 'absolute',
        right: 20,
        zIndex: 2,
    },
    controlButton: {
        backgroundColor: '#fff',
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    poiPreviewRow: {
        flexDirection: 'row',
    },
    audioWrapper: {
        marginTop: 8,
    },
    closeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
    },
    poiImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#eee',
    },
    poiInfo: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'space-between',
    },
    poiTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111',
        marginRight: 16,
    },
    poiType: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
    },
    detailButton: {
        backgroundColor: '#0f172a',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    detailButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
});
