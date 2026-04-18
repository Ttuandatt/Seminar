import React, { useCallback, useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { publicService, Tour } from '../../../services/publicService';
import { touristService } from '../../../services/touristService';
import { OfflineDataLayer } from '../../../services/offlineDataLayer';
import { getDistance } from '../../../utils/distance';
import AudioPlayer from '../../../components/AudioPlayer';
import { LocateFixed, XCircle, CheckCircle2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../context/LanguageContext';
import { resolveExactAudioTrack } from '../../../utils/audioMedia';
import { getMediaUrl } from '../../../services/api';
import { getMissingAudioNote } from '../../../services/localizationCopy';
import { useGlobalAudio } from '../../../context/AudioContext';
import { buildGoogleTtsUrl } from '../../../services/runtimeLocalizationService';

type NarrationType = 'INTRO' | 'TRANSITION' | 'ARRIVAL' | 'OUTRO';
interface TourNarration {
    id: string;
    type: NarrationType;
    orderIndex: number;
    fromPoiId: string | null;
    toPoiId: string | null;
    scriptVi: string | null;
    scriptEn: string | null;
    audioViUrl: string | null;
    audioEnUrl: string | null;
}

const { width } = Dimensions.get('window');

export default function TourFollowScreen() {
    const { id, source } = useLocalSearchParams();
    const isCustom = source === 'custom';
    const router = useRouter();
    const mapRef = useRef<MapView>(null);

    const [tour, setTour] = useState<Tour | null>(null);
    const [narrations, setNarrations] = useState<TourNarration[]>([]);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [currentStep, setCurrentStep] = useState(0); // Index of the next POI to reach
    const [triggeredStops, setTriggeredStops] = useState<Set<number>>(new Set());
    const [activeNarration, setActiveNarration] = useState<TourNarration | null>(null);
    const [poiAudioReadyToPlay, setPoiAudioReadyToPlay] = useState(false);

    const { playGlobalAudio, stopAndClearAudio, isPlaying, position, duration, currentAudioUrl } = useGlobalAudio();
    const { t } = useTranslation();
    const { lang, getPoiName, getPoiDescription } = useLanguage();

    const narrationHelpers = {
        find: (list: TourNarration[], type: NarrationType, toPoiId?: string) =>
            list.find(n => n.type === type && (!toPoiId || n.toPoiId === toPoiId)),
        play: (n: TourNarration, language: string, playFn: (url: string, id: string) => void, setFn: (n: TourNarration) => void) => {
            const isEn = language === 'en' || language === 'EN';
            const url = isEn ? n.audioEnUrl : n.audioViUrl;
            const fallbackUrl = n.audioViUrl || n.audioEnUrl;
            const activeUrl = url || fallbackUrl;

            setFn(n);
            if (activeUrl) {
                playFn(activeUrl, `narration-${n.id}`);
            } else {
                // FALLBACK TO TTS
                const text = isEn ? (n.scriptEn || n.scriptVi) : (n.scriptVi || n.scriptEn);
                if (text) {
                    const ttsUrl = buildGoogleTtsUrl(text, language);
                    if (ttsUrl) {
                        playFn(ttsUrl, `narration-${n.id}`);
                    }
                }
            }
        }
    };

    const generateClientNarration = (tourData: Tour | null, pois: any[]): TourNarration[] => {
        if (!tourData || !pois.length) return [];
        const generated: TourNarration[] = [];
        let orderIndex = 0;

        generated.push({
            id: 'intro', type: 'INTRO', orderIndex: orderIndex++,
            fromPoiId: null, toPoiId: pois[0].poiId,
            scriptVi: `Chào mừng bạn đến với ${tourData.nameVi}! Tour gồm ${pois.length} điểm dừng. Hãy bắt đầu hành trình nào!`,
            scriptEn: `Welcome to ${tourData.nameEn || tourData.nameVi}! This tour has ${pois.length} stops. Let's begin!`,
            audioViUrl: null, audioEnUrl: null
        });

        for (let i = 0; i < pois.length; i++) {
            generated.push({
                id: `trans-${i}`, type: 'TRANSITION', orderIndex: orderIndex++,
                fromPoiId: i > 0 ? pois[i - 1].poiId : null, toPoiId: pois[i].poiId,
                scriptVi: `Tiếp theo chúng ta sẽ đến ${pois[i].poi.nameVi}.`,
                scriptEn: `Next we will head to ${pois[i].poi.nameEn || pois[i].poi.nameVi}.`,
                audioViUrl: null, audioEnUrl: null
            });

            generated.push({
                id: `arr-${i}`, type: 'ARRIVAL', orderIndex: orderIndex++,
                fromPoiId: null, toPoiId: pois[i].poiId,
                scriptVi: `Chúng ta đã đến ${pois[i].poi.nameVi}!`,
                scriptEn: `We've arrived at ${pois[i].poi.nameEn || pois[i].poi.nameVi}!`,
                audioViUrl: null, audioEnUrl: null
            });
        }

        generated.push({
            id: 'outro', type: 'OUTRO', orderIndex: orderIndex++,
            fromPoiId: pois[pois.length - 1].poiId, toPoiId: null,
            scriptVi: `Chúc mừng bạn đã hoàn thành ${tourData.nameVi}!`,
            scriptEn: `Congratulations! You have completed ${tourData.nameEn || tourData.nameVi}.`,
            audioViUrl: null, audioEnUrl: null
        });
        return generated;
    };

    const fetchTourData = async () => {
        if (typeof id === 'string') {
            try {
                const [data, narrationData] = await Promise.all([
                    isCustom
                        ? touristService.getMyTourDetail(id)
                        : publicService.getTourDetail(id),
                    !isCustom ? publicService.getTourNarrations(id).catch(() => []) : Promise.resolve([])
                ]);
                setTour(data);
                if (isCustom && data) {
                    setNarrations(generateClientNarration(data, data.tourPois || []));
                } else if (data) {
                    if (!narrationData || narrationData.length === 0) {
                        setNarrations(generateClientNarration(data, data.tourPois || []));
                    } else {
                        setNarrations(narrationData);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch tour data:', err);
            }
        }
    };

    useEffect(() => {
        fetchTourData();
    }, [id]);

    const fetchTourData = async () => {
        if (typeof id === 'string') {
            const data = isCustom
                ? await touristService.getMyTourDetail(id)
                : await OfflineDataLayer.getTour(id);
            setTour(data);
        }
    };

    const handleLocationUpdate = useCallback((loc: Location.LocationObject) => {
        setLocation(loc);

        if (!tour?.tourPois || currentStep >= tour.tourPois.length) return;

        const targetPoi = tour.tourPois[currentStep].poi;
        const dist = getDistance(
            { latitude: loc.coords.latitude, longitude: loc.coords.longitude },
            { latitude: Number(targetPoi.latitude), longitude: Number(targetPoi.longitude) }
        );

        if (dist <= (targetPoi.triggerRadius || 50) && !triggeredStops.has(currentStep)) {
            // Play ARRIVAL narration if exists
            const arrival = narrationHelpers.find(narrations, 'ARRIVAL', targetPoi.id);
            if (arrival && (arrival.audioViUrl || arrival.audioEnUrl)) {
                narrationHelpers.play(arrival, lang, playGlobalAudio, setActiveNarration);
                setPoiAudioReadyToPlay(false);
            } else {
                if (arrival) setActiveNarration(arrival);
                setPoiAudioReadyToPlay(true);
            }
            setTriggeredStops((prev) => new Set(prev).add(currentStep));
        }
    }, [currentStep, tour, triggeredStops, narrations, lang, playGlobalAudio]);

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
                handleLocationUpdate
            );
        })();

        return () => {
            if (locationSub) locationSub.remove();
        };
    }, [handleLocationUpdate]);

    // Derived values for UI and effects
    const currentTourPois = tour?.tourPois || [];
    const isFinished = tour && currentStep >= currentTourPois.length;
    const targetPoi = isFinished ? null : currentTourPois[currentStep]?.poi;
    const hasArrived = triggeredStops.has(currentStep);

    // Handle INTRO narration
    useEffect(() => {
        if (tour && narrations.length > 0 && currentStep === 0 && !triggeredStops.has(0)) {
            const intro = narrationHelpers.find(narrations, 'INTRO');
            if (intro) {
                narrationHelpers.play(intro, lang, playGlobalAudio, setActiveNarration);
            }
        }
    }, [tour, narrations, currentStep, triggeredStops]);

    // Handle OUTRO narration
    useEffect(() => {
        if (isFinished && narrations.length > 0) {
            const outro = narrationHelpers.find(narrations, 'OUTRO');
            if (outro) {
                narrationHelpers.play(outro, lang, playGlobalAudio, setActiveNarration);
            }
        }
    }, [isFinished, narrations, lang, playGlobalAudio]);

    // Check when ARRIVAL audio ends to trigger POI audio
    useEffect(() => {
        if (activeNarration && activeNarration.type === 'ARRIVAL' && !poiAudioReadyToPlay) {
            const activeUrl = (lang === 'en') ? activeNarration.audioEnUrl : activeNarration.audioViUrl;
            const fallbackUrl = activeNarration.audioViUrl || activeNarration.audioEnUrl;
            const url = activeUrl || fallbackUrl;

            if (!url) {
                setPoiAudioReadyToPlay(true);
                return;
            }

            const fullUrl = getMediaUrl(url);
            if (currentAudioUrl === fullUrl) {
                if (!isPlaying && duration > 0 && position >= duration - 500) {
                    setPoiAudioReadyToPlay(true);
                }
            } else if (currentAudioUrl && currentAudioUrl !== fullUrl) {
                // Audio changed or overriden
                setPoiAudioReadyToPlay(true);
            }
        }
    }, [isPlaying, position, duration, currentAudioUrl, activeNarration, poiAudioReadyToPlay, lang]);

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

    if (!tour?.tourPois?.length) return null;

    const coordinates = currentTourPois.map(tp => ({
        latitude: Number(tp.poi.latitude),
        longitude: Number(tp.poi.longitude),
    }));

    // Get Audio conditionally
    const audioMedia = resolveExactAudioTrack(targetPoi?.media, lang);
    const audioUrl = audioMedia?.url ? getMediaUrl(audioMedia.url) : null;
    const audioMissingNote = targetPoi ? getMissingAudioNote(lang) : '';

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

                {currentTourPois.map((tp, index) => {
                    const isPassed = index < currentStep;
                    const isCurrent = index === currentStep;
                    let markerColor = 'gray';
                    if (isPassed) {
                        markerColor = 'green';
                    } else if (isCurrent) {
                        markerColor = 'blue';
                    }
                    return (
                        <Marker
                            key={tp.id}
                            coordinate={{ latitude: Number(tp.poi.latitude), longitude: Number(tp.poi.longitude) }}
                            title={`${index + 1}. ${getPoiName(tp.poi)}`}
                            pinColor={markerColor}
                        />
                    );
                })}
            </MapView>

            <TouchableOpacity style={styles.exitButton} onPress={() => {
                stopAndClearAudio();
                router.back();
            }}>
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

                        {/* Narration Text Fallback */}
                        {activeNarration && (
                            <View style={styles.narrationBox}>
                                <Text style={styles.narrationText}>
                                    💬 {(lang === 'en') ? (activeNarration.scriptEn || activeNarration.scriptVi) : (activeNarration.scriptVi || activeNarration.scriptEn)}
                                </Text>
                            </View>
                        )}

                        {hasArrived && audioUrl && (
                            <View style={styles.audioWrapper}>
                                <AudioPlayer audioUrl={audioUrl} poiId={targetPoi!.id} autoPlay={poiAudioReadyToPlay} />
                            </View>
                        )}

                        {hasArrived && !audioUrl && (
                            <Text style={styles.audioMissingText}>{audioMissingNote}</Text>
                        )}

                        <View style={styles.navButtons}>
                            <TouchableOpacity
                                style={[styles.nextButton, !hasArrived && styles.nextButtonDisabled]}
                                onPress={() => {
                                    const nextIndex = currentStep + 1;
                                    if (nextIndex < currentTourPois.length) {
                                        const nextPoiId = currentTourPois[nextIndex].poiId;
                                        const transition = narrationHelpers.find(narrations, 'TRANSITION', nextPoiId);
                                        if (transition) {
                                            narrationHelpers.play(transition, lang, playGlobalAudio, setActiveNarration);
                                        } else {
                                            setActiveNarration(null);
                                        }
                                    }
                                    setCurrentStep(nextIndex);
                                }}
                                disabled={!hasArrived}
                            >
                                <Text style={styles.nextButtonText}>
                                    {currentStep === currentTourPois.length - 1 ? t('tourFollow.endTour') : t('tourFollow.nextStop')}
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
    audioMissingText: {
        marginBottom: 16,
        fontSize: 13,
        lineHeight: 18,
        color: '#b45309',
        fontStyle: 'italic',
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
    },
    narrationBox: {
        backgroundColor: '#f0f9ff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#0ea5e9',
    },
    narrationText: {
        fontSize: 14,
        color: '#0369a1',
        fontStyle: 'italic',
        lineHeight: 20,
    }
});
