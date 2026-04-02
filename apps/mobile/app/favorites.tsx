import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { touristService } from '../services/touristService';
import { getMediaUrl } from '../services/api';
import { Heart } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';

export default function FavoritesScreen() {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { t } = useTranslation();
    const { getPoiName } = useLanguage();

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            const data = await touristService.getFavorites();
            setFavorites(data);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#e11d48" />
            </View>
        );
    }

    if (favorites.length === 0) {
        return (
            <View style={styles.centered}>
                <Heart size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>{t('favorites.empty')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('favorites.title')}</Text>
            </View>

            <FlatList
                data={favorites}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => {
                    const poi = item.poi;
                    const imageUrl = poi?.media?.[0]?.url ? getMediaUrl(poi.media[0].url) : 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop';

                    return (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => router.push(`/poi/${poi.id}`)}
                        >
                            <Image source={{ uri: imageUrl }} style={styles.cardImage} />
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{getPoiName(poi)}</Text>
                                <Text style={styles.cardType}>{poi.poiType === 'MAIN' ? t('favorites.mainPoint') : t('favorites.nearbyPoint')}</Text>
                                <View style={styles.heartIcon}>
                                    <Heart size={20} color="#e11d48" fill="#e11d48" />
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
    emptyText: { fontSize: 16, color: '#64748b', marginTop: 16 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        flexDirection: 'row',
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardImage: { width: 100, height: 100 },
    cardContent: { flex: 1, padding: 12, justifyContent: 'center' },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 4, paddingRight: 24 },
    cardType: { fontSize: 14, color: '#64748b' },
    heartIcon: { position: 'absolute', right: 12, top: 12 },
});
