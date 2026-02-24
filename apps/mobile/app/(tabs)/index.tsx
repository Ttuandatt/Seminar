import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { publicService, Poi } from '../../services/publicService';

const { width } = Dimensions.get('window');
const VINH_KHANH_REGION = {
    latitude: 10.7553,
    longitude: 106.6965,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
};

export default function MapScreen() {
    const router = useRouter();
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [pois, setPois] = useState<Poi[]>([]);
    const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        })();
    }, []);

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

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={VINH_KHANH_REGION}
                showsUserLocation
                showsMyLocationButton
            >
                {pois.map((poi) => (
                    <Marker
                        key={poi.id}
                        coordinate={{ latitude: poi.latitude, longitude: poi.longitude }}
                        title={poi.nameVi}
                        description={poi.poiType}
                        pinColor={poi.poiType === 'MAIN' ? 'red' : 'gold'}
                        onPress={() => handleMarkerPress(poi)}
                    />
                ))}
            </MapView>

            {selectedPoi && (
                <View style={styles.bottomSheet}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setSelectedPoi(null)}
                    >
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                    <Image
                        source={{ uri: selectedPoi.media?.[0]?.url || 'https://via.placeholder.com/150' }}
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
            )}
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
    bottomSheet: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
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
        marginRight: 16, // space for close button
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
