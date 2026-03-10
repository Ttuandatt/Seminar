import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, X, Headphones, Navigation } from 'lucide-react-native';
import { getMediaUrl } from '../services/api';

interface POITriggerSheetProps {
    poi: {
        id: string;
        name: string;
        nameEn?: string;
        description?: string;
        images?: { url: string }[];
        audioUrl?: string;
        distance?: number;
    };
    language: string;
    onDismiss: () => void;
    onListen: () => void;
}

export default function POITriggerSheet({ poi, language, onDismiss, onListen }: POITriggerSheetProps) {
    const router = useRouter();
    const displayName = language === 'en' && poi.nameEn ? poi.nameEn : poi.name;
    const imageUrl = poi.images?.[0]?.url ? getMediaUrl(poi.images[0].url) : null;
    const distanceText = poi.distance
        ? poi.distance < 1000
            ? `${Math.round(poi.distance)}m`
            : `${(poi.distance / 1000).toFixed(1)}km`
        : null;

    return (
        <View style={styles.overlay}>
            <View style={styles.sheet}>
                {/* Close button */}
                <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
                    <X size={20} color="#64748b" />
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.pinBadge}>
                        <MapPin size={16} color="#fff" />
                    </View>
                    <Text style={styles.nearbyText}>Bạn đang ở gần</Text>
                </View>

                {/* POI Info */}
                <View style={styles.poiInfo}>
                    {imageUrl && (
                        <Image source={{ uri: imageUrl }} style={styles.poiImage} />
                    )}
                    <View style={styles.poiTextContainer}>
                        <Text style={styles.poiName} numberOfLines={2}>{displayName}</Text>
                        {distanceText && (
                            <View style={styles.distanceRow}>
                                <Navigation size={12} color="#3b82f6" />
                                <Text style={styles.distanceText}>{distanceText}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.listenButton} onPress={onListen}>
                        <Headphones size={18} color="#fff" />
                        <Text style={styles.listenText}>Nghe thuyết minh</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.detailButton}
                        onPress={() => {
                            onDismiss();
                            router.push(`/poi/${poi.id}`);
                        }}
                    >
                        <Text style={styles.detailText}>Xem chi tiết</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
    },
    sheet: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 24,
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    pinBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#2563EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    nearbyText: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    poiInfo: {
        flexDirection: 'row',
        gap: 14,
        marginBottom: 20,
    },
    poiImage: {
        width: 80,
        height: 80,
        borderRadius: 16,
        backgroundColor: '#E2E8F0',
    },
    poiTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    poiName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 8,
    },
    distanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    distanceText: {
        fontSize: 14,
        color: '#2563EB',
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        gap: 16,
    },
    listenButton: {
        flex: 2,
        flexDirection: 'row',
        backgroundColor: '#2563EB',
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    listenText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    detailButton: {
        flex: 1,
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
    },
    detailText: {
        color: '#475569',
        fontSize: 15,
        fontWeight: '600',
    },
});
