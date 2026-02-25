import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { touristService } from '../services/touristService';
import { getMediaUrl } from '../services/api';
import { Clock } from 'lucide-react-native';

export default function HistoryScreen() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const data = await touristService.getHistory();
            setHistory(data.data || data); // depends on pagination response format
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (history.length === 0) {
        return (
            <View style={styles.centered}>
                <Clock size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>Chưa có lịch sử di chuyển.</Text>
            </View>
        );
    }

    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Lịch sử trải nghiệm</Text>
            </View>

            <FlatList
                data={history}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => {
                    const poi = item.poi;
                    const imageUrl = poi?.media?.[0]?.url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop';

                    return (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => router.push(`/poi/${poi.id}`)}
                        >
                            <Image source={{ uri: imageUrl }} style={styles.cardImage} />
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{poi.nameVi}</Text>
                                <Text style={styles.cardType}>{poi.poiType === 'MAIN' ? 'Cột mốc chính' : 'Điểm lân cận'}</Text>
                                <Text style={styles.timestamp}>{formatDate(item.viewedAt || item.createdAt)}</Text>
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
    cardImage: { width: 80, height: 80 },
    cardContent: { flex: 1, padding: 12, justifyContent: 'center' },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
    cardType: { fontSize: 13, color: '#64748b', marginBottom: 4 },
    timestamp: { fontSize: 12, color: '#94a3b8' },
});
