import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { MapPin, Navigation, Pencil, Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { publicService, Tour } from '../../services/publicService';
import { touristService } from '../../services/touristService';
import { OfflineDataLayer } from '../../services/offlineDataLayer';
import DownloadTourButton from '../../components/DownloadTourButton';

const { width } = Dimensions.get('window');

export default function TourDetailScreen() {
    const { id, source } = useLocalSearchParams();
    const router = useRouter();
    const { t } = useTranslation();
    const { getTourName, getTourDescription, getPoiName } = useLanguage();
    const isCustom = source === 'custom';

    const [tour, setTour] = useState<Tour | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id, source]);

    const fetchData = async () => {
        try {
            if (typeof id === 'string') {
                const data = isCustom
                    ? await touristService.getMyTourDetail(id)
                    : await OfflineDataLayer.getTour(id);
                setTour(data);
            }
        } catch (error) {
            console.error('Error fetching Tour details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            t('customTour.deleteTitle'),
            t('customTour.deleteConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'), style: 'destructive',
                    onPress: async () => {
                        try {
                            await touristService.deleteMyTour(id as string);
                            router.replace('/(tabs)/tours');
                        } catch (e) {
                            console.error('Error deleting tour:', e);
                        }
                    },
                },
            ],
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0f172a" />
            </View>
        );
    }

    if (!tour || !tour.tourPois || tour.tourPois.length === 0) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{t('tours.notFound')}</Text>
            </View>
        );
    }

    // Extract map coordinates
    const coordinates = tour.tourPois.map(tp => ({
        latitude: tp.poi?.latitude || 0,
        longitude: tp.poi?.longitude || 0,
    }));

    const initialRegion = {
        latitude: coordinates[0].latitude,
        longitude: coordinates[0].longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
    };

    return (
        <View style={styles.container}>
            {/* Map Preview */}
            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    initialRegion={initialRegion}
                >
                    <Polyline
                        coordinates={coordinates}
                        strokeColor="#3b82f6"
                        strokeWidth={4}
                        lineDashPattern={[1]}
                    />
                    {tour.tourPois.map((tp, index) => (
                        <Marker
                            key={tp.id}
                            coordinate={{ latitude: tp.poi.latitude, longitude: tp.poi.longitude }}
                            title={`${index + 1}. ${getPoiName(tp.poi)}`}
                            pinColor={index === 0 ? 'green' : index === tour.tourPois!.length - 1 ? 'red' : 'blue'}
                        />
                    ))}
                </MapView>
            </View>

            {/* Tour Info & POI List */}
            <ScrollView style={styles.contentContainer} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.header}>
                    <Text style={styles.title}>{getTourName(tour)}</Text>
                    <Text style={styles.description}>{getTourDescription(tour)}</Text>
                </View>

                <Text style={styles.sectionTitle}>{t('tours.route')} ({tour.tourPois?.length || 0} {t('tours.points')})</Text>

                <View style={styles.timeline}>
                    {tour.tourPois.map((tp, index) => (
                        <TouchableOpacity
                            key={tp.id}
                            style={styles.timelineItem}
                            onPress={() => router.push(`/poi/${tp.poiId}`)}
                        >
                            <View style={styles.timelineLeft}>
                                <View style={styles.timelineDot}>
                                    <Text style={styles.timelineDotText}>{index + 1}</Text>
                                </View>
                                {index < tour.tourPois!.length - 1 && <View style={styles.timelineLine} />}
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={styles.poiName}>{getPoiName(tp.poi)}</Text>
                                <Text style={styles.poiType}>{tp.poi.poiType === 'MAIN' ? t('tours.mainPoint') : t('tours.nearby')}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.footer}>
                {!isCustom && (
                    <View style={{ marginBottom: 12 }}>
                        <DownloadTourButton tourId={tour.id} />
                    </View>
                )}
                {isCustom && (
                    <View style={styles.customActions}>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => router.push(`/tour/edit/${tour.id}`)}
                        >
                            <Pencil size={18} color="#3b82f6" />
                            <Text style={styles.editButtonText}>{t('common.edit')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                            <Trash2 size={18} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                )}
                <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => router.push(`/tour/follow/${tour.id}${isCustom ? '?source=custom' : ''}`)}
                >
                    <Navigation size={20} color="#fff" />
                    <Text style={styles.startButtonText}>{t('tours.startTour')}</Text>
                </TouchableOpacity>
            </View>
        </View>
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
        fontSize: 16,
        color: '#64748b',
    },
    mapContainer: {
        height: 300,
        width: '100%',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    contentContainer: {
        flex: 1,
        padding: 20,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
    },
    description: {
        fontSize: 15,
        color: '#475569',
        lineHeight: 22,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 16,
    },
    timeline: {
        marginTop: 8,
    },
    timelineItem: {
        flexDirection: 'row',
    },
    timelineLeft: {
        width: 30,
        alignItems: 'center',
    },
    timelineDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    timelineDotText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#e2e8f0',
        marginTop: -4,
        marginBottom: -4,
    },
    timelineContent: {
        flex: 1,
        paddingBottom: 24,
        paddingLeft: 12,
    },
    poiName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    poiType: {
        fontSize: 13,
        color: '#64748b',
    },
    footer: {
        padding: 20,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        backgroundColor: '#fff',
    },
    customActions: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    editButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#3b82f6',
        gap: 6,
    },
    editButtonText: {
        color: '#3b82f6',
        fontSize: 15,
        fontWeight: '600',
    },
    deleteButton: {
        width: 48,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    startButton: {
        backgroundColor: '#3b82f6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    startButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
