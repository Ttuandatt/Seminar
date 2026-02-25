import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { MapPin, Navigation } from 'lucide-react-native';
import { publicService, Tour } from '../../services/publicService';

const { width } = Dimensions.get('window');

export default function TourDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [tour, setTour] = useState<Tour | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            if (typeof id === 'string') {
                const data = await publicService.getTourDetail(id);
                setTour(data);
            }
        } catch (error) {
            console.error('Error fetching Tour details:', error);
        } finally {
            setLoading(false);
        }
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
                <Text style={styles.errorText}>Tour không tồn tại hoặc chưa có điểm dừng.</Text>
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
                            title={`${index + 1}. ${tp.poi.nameVi}`}
                            pinColor={index === 0 ? 'green' : index === tour.tourPois!.length - 1 ? 'red' : 'blue'}
                        />
                    ))}
                </MapView>
            </View>

            {/* Tour Info & POI List */}
            <ScrollView style={styles.contentContainer} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.header}>
                    <Text style={styles.title}>{tour.nameVi}</Text>
                    <Text style={styles.description}>{tour.descriptionVi}</Text>
                </View>

                <Text style={styles.sectionTitle}>🗺️ Lộ trình ({(tour.tourPois?.length || 0)} điểm)</Text>

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
                                <Text style={styles.poiName}>{tp.poi.nameVi}</Text>
                                <Text style={styles.poiType}>{tp.poi.poiType === 'MAIN' ? 'Điểm chính' : 'Lân cận'}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Start Tour Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => router.push(`/tour/follow/${tour.id}`)}
                >
                    <Navigation size={20} color="#fff" />
                    <Text style={styles.startButtonText}>Bắt đầu Tour</Text>
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
