import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { publicService, Tour } from '../../services/publicService';
import { Map, Clock } from 'lucide-react-native';

export default function ToursScreen() {
    const router = useRouter();
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTours();
    }, []);

    const fetchTours = async () => {
        try {
            const data = await publicService.getAllTours();
            setTours(data);
        } catch (error) {
            console.error('Error fetching tours:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: Tour }) => (
        <TouchableOpacity
            style={styles.tourCard}
            onPress={() => router.push(`/tour/${item.id}`)}
        >
            <View style={styles.tourHeader}>
                <Text style={styles.tourTitle}>{item.nameVi}</Text>
            </View>

            <Text style={styles.tourDescription} numberOfLines={2}>
                {item.descriptionVi || 'Không có mô tả'}
            </Text>

            <View style={styles.tourMeta}>
                <View style={styles.metaBadge}>
                    <Map size={16} color="#64748b" />
                    <Text style={styles.metaText}>{item._count?.tourPois || 0} điểm đến</Text>
                </View>
                <View style={styles.metaBadge}>
                    <Clock size={16} color="#64748b" />
                    <Text style={styles.metaText}>{item.estimatedDuration || 0} phút</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0f172a" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Khám phá Tours</Text>
            <FlatList
                data={tours}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={styles.emptyText}>Chưa có tour nào.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: '#fff',
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    tourCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    tourHeader: {
        marginBottom: 8,
    },
    tourTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    tourDescription: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 16,
    },
    tourMeta: {
        flexDirection: 'row',
        gap: 16,
    },
    metaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 6,
    },
    metaText: {
        fontSize: 13,
        color: '#475569',
        fontWeight: '500',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#94a3b8',
        fontSize: 16,
    }
});
