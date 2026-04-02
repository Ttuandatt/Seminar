import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { publicService, Tour } from '../../../services/publicService';
import { getDistance } from '../../../utils/distance';
import AudioPlayer from '../../../components/AudioPlayer';
import { LocateFixed, XCircle, CheckCircle2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../context/LanguageContext';
import { useGlobalAudio } from '../../../context/AudioContext';

const { width } = Dimensions.get('window');

export default function TourFollowScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const mapRef = useRef<MapView>(null);

    const [tour, setTour] = useState<Tour | null>(null);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [currentStep, setCurrentStep] = useState(0); // Index of the next POI to reach
    const [triggeredStops, setTriggeredStops] = useState<Set<number>>(new Set());
    const { t } = useTranslation();
    const { lang, getPoiName, getPoiDescription } = useLanguage();
    const { stopAndClearAudio } = useGlobalAudio();

    useEffect(() => {
        fetchTourData();

        // Cleanup audio when exiting navigation screen
        return () => {
            setTimeout(() => {
                stopAndClearAudio();
            }, 0);
        };
    }, [id]);

    const fetchTourData = async () => {
        if (typeof id === 'string') {
            const data = await publicService.getTourDetail(id);
            setTour(data);
        }
    };

    useEffect(() => {
        let locationSub: Location.LocationSubscription | null = null;

        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            let initLoc = await Location.getCurrentPositionAsync({});
            setLocation(initLoc);

            locationSub = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 2000,
                    distanceInterval: 5,
                },
                (loc) => {
                    setLocation(loc);

                    if (tour && tour.tourPois && currentStep < tour.tourPois.length) {
                        const targetPoi = tour.tourPois[currentStep].poi;
                        const dist = getDistance(
                            { latitude: loc.coords.latitude, longitude: loc.coords.longitude },
                            { latitude: Number(targetPoi.latitude), longitude: Number(targetPoi.longitude) }
                        );

                        if (dist <= (targetPoi.triggerRadius || 50)) {
                            // Arrived at current target!
                            if (!triggeredStops.has(currentStep)) {
                                setTriggeredStops(prev => new Set(prev).add(currentStep));
                                // Auto advance to next step after a delay, or user can manual next
                            }
                        }
                    }
                }
            );
        })();

        return () => {
            if (locationSub) locationSub.remove();
        };
    }, [tour, currentStep]);

    const goToUserLocation = async () => {
        if (location) {
            mapRef.current?.animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            }, 1000);
        } else {
            let loc = await Location.getLastKnownPositionAsync({});
            if (loc) {
                mapRef.current?.animateToRegion({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                }, 1000);
            }
        }
    };

    if (!tour || !tour.tourPois) return null;

    const coordinates = tour.tourPois.map(tp => ({
        latitude: Number(tp.poi.latitude),
        longitude: Number(tp.poi.longitude),
    }));

    // Target POI information
    const isFinished = currentStep >= tour.tourPois.length;
    const targetPoi = isFinished ? null : tour.tourPois[currentStep].poi;
    const hasArrived = triggeredStops.has(currentStep);

    // Get Audio conditionally
    const audioMedia = targetPoi?.media?.find((m: any) => m.type === 'AUDIO' && (m.language === lang.toUpperCase() || m.language === 'ALL'));

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: coordinates[0].latitude,
                    longitude: coordinates[0].longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                }}
                showsUserLocation
                showsMyLocationButton={false}
            >
                <Polyline
                    coordinates={coordinates}
                    strokeColor="#3b82f6"
                    strokeWidth={5}
                />

                {tour.tourPois.map((tp, index) => {
                    const isPassed = index < currentStep;
                    const isCurrent = index === currentStep;
                    return (
                        <Marker
                            key={tp.id}
                            coordinate={{ latitude: Number(tp.poi.latitude), longitude: Number(tp.poi.longitude) }}
                            title={`${index + 1}. ${getPoiName(tp.poi)}`}
                            pinColor={isPassed ? 'green' : isCurrent ? 'blue' : 'gray'}
                        />
                    );
                })}
            </MapView>

            <TouchableOpacity style={styles.exitButton} onPress={() => router.back()}>
                <XCircle size={32} color="#dc2626" fill="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.locateButton} onPress={goToUserLocation}>
                <LocateFixed size={24} color="#0f172a" />
            </TouchableOpacity>

            <View style={styles.bottomCard}>
                {isFinished ? (
                    <View style={styles.finishedContainer}>
                        <CheckCircle2 size={48} color="#16a34a" />
                        <Text style={styles.finishedTitle}>{t('tourFollow.completed')}</Text>
                        <Text style={styles.finishedSubtitle}>{t('tourFollow.congratulations')}</Text>
                        <TouchableOpacity style={styles.doneButton} onPress={() => router.push('/(tabs)/tours')}>
                            <Text style={styles.doneButtonText}>{t('tourFollow.backToList')}</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View style={styles.targetHeader}>
                            <Text style={styles.stepText}>{t('tourFollow.destination')} {currentStep + 1}/{tour.tourPois.length}</Text>
                            {hasArrived ? (
                                <Text style={styles.arrivedBadge}>{t('tourFollow.arrived')}</Text>
                            ) : (
                                <Text style={styles.navigatingBadge}>{t('tourFollow.navigating')}</Text>
                            )}
                        </View>

                        <Text style={styles.targetTitle}>{targetPoi ? getPoiName(targetPoi) : ''}</Text>
                        <Text style={styles.targetDescription} numberOfLines={2}>
                            {targetPoi ? (getPoiDescription(targetPoi) || t('common.noDescription')) : ''}
                        </Text>

                        {audioMedia && (
                            <View style={styles.audioWrapper}>
                                <AudioPlayer audioUrl={audioMedia.url} poiId={targetPoi.id} autoPlay={true} />
                            </View>
                        )}

                        <View style={styles.navButtons}>
                            <TouchableOpacity
                                style={[styles.nextButton, !hasArrived && styles.nextButtonDisabled]}
                                onPress={() => setCurrentStep(prev => prev + 1)}
                                disabled={!hasArrived}
                            >
                                <Text style={styles.nextButtonText}>
                                    {currentStep === tour.tourPois!.length - 1 ? t('tourFollow.endTour') : t('tourFollow.nextStop')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
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
    exitButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    locateButton: {
        position: 'absolute',
        right: 20,
        top: 100,
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
    bottomCard: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
    },
    targetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    stepText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#64748b',
    },
    arrivedBadge: {
        color: '#16a34a',
        fontWeight: 'bold',
        fontSize: 13,
        backgroundColor: '#dcfce7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    navigatingBadge: {
        color: '#f59e0b',
        fontWeight: 'bold',
        fontSize: 13,
        backgroundColor: '#fef3c7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    targetTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 4,
    },
    targetDescription: {
        fontSize: 14,
        color: '#475569',
        marginBottom: 16,
    },
    audioWrapper: {
        marginBottom: 16,
    },
    navButtons: {
        flexDirection: 'row',
    },
    nextButton: {
        flex: 1,
        backgroundColor: '#2563eb',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    nextButtonDisabled: {
        backgroundColor: '#94a3b8',
    },
    nextButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
    finishedContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    finishedTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0f172a',
        marginTop: 12,
        marginBottom: 8,
    },
    finishedSubtitle: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 24,
    },
    doneButton: {
        backgroundColor: '#16a34a',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
    },
    doneButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
