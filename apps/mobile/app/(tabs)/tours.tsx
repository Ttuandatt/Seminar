import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { publicService, Tour } from '../../services/publicService';
import { touristService } from '../../services/touristService';
import { Map, Clock, Plus, LogIn } from 'lucide-react-native';
import { useLanguage } from '../../context/LanguageContext';

type TabKey = 'official' | 'myTours';

export default function ToursScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { getTourName, getTourDescription } = useLanguage();
    const insets = useSafeAreaInsets();

    const [tab, setTab] = useState<TabKey>('official');
    const [officialTours, setOfficialTours] = useState<Tour[]>([]);
    const [myTours, setMyTours] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [myToursLoading, setMyToursLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        fetchOfficialTours();
        checkAuth(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            checkAuth(tab === 'myTours');
        }, [tab])
    );

    const checkAuth = async (loadMyTours = false) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
            setIsLoggedIn(false);
            setMyTours([]);
            return;
        }

        try {
            await touristService.getProfile();
            setIsLoggedIn(true);
            if (loadMyTours) {
                fetchMyTours();
            }
        } catch (error: any) {
            const status = error?.response?.status;
            if (status === 401) {
                await AsyncStorage.removeItem('accessToken');
            }

            setIsLoggedIn(false);
            setMyTours([]);
        }
    };

    const fetchOfficialTours = async () => {
        try {
            const data = await publicService.getAllTours();
            setOfficialTours(data);
        } catch (error) {
            console.error('Error fetching tours:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyTours = async () => {
        setMyToursLoading(true);
        try {
            const data = await touristService.getMyTours();
            setMyTours(data);
        } catch (error: any) {
            const status = error?.response?.status;
            if (status === 401) {
                await AsyncStorage.removeItem('accessToken');
                setIsLoggedIn(false);
                setMyTours([]);
                return;
            }

            console.error('Error fetching my tours:', error);
        } finally {
            setMyToursLoading(false);
        }
    };

    const renderOfficialItem = ({ item }: { item: Tour }) => (
        <TouchableOpacity
            style={styles.tourCard}
            onPress={() => router.push(`/tour/${item.id}`)}
        >
            <View style={styles.tourHeader}>
                <Text style={styles.tourTitle}>{getTourName(item)}</Text>
            </View>
            <Text style={styles.tourDescription} numberOfLines={2}>
                {getTourDescription(item) || t('common.noDescription')}
            </Text>
            <View style={styles.tourMeta}>
                <View style={styles.metaBadge}>
                    <Map size={16} color="#64748b" />
                    <Text style={styles.metaText}>{item._count?.tourPois || 0} {t('tours.destinations')}</Text>
                </View>
                <View style={styles.metaBadge}>
                    <Clock size={16} color="#64748b" />
                    <Text style={styles.metaText}>{item.estimatedDuration || 0} {t('tours.minutes')}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderMyTourItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.tourCard}
            onPress={() => router.push(`/tour/${item.id}?source=custom`)}
        >
            <View style={styles.tourHeader}>
                <Text style={styles.tourTitle}>{item.nameVi}</Text>
            </View>
            {item.descriptionVi && (
                <Text style={styles.tourDescription} numberOfLines={2}>
                    {item.descriptionVi}
                </Text>
            )}
            <View style={styles.tourMeta}>
                <View style={styles.metaBadge}>
                    <Map size={16} color="#64748b" />
                    <Text style={styles.metaText}>{item._count?.tourPois || 0} {t('tours.destinations')}</Text>
                </View>
                <View style={styles.metaBadge}>
                    <Clock size={16} color="#64748b" />
                    <Text style={styles.metaText}>{item.estimatedDuration || 0} {t('tours.minutes')}</Text>
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
            <Text style={styles.headerTitle}>{t('tours.title')}</Text>

            {/* Segmented Control */}
            <View style={styles.segmentContainer}>
                <TouchableOpacity
                    style={[styles.segment, tab === 'official' && styles.segmentActive]}
                    onPress={() => setTab('official')}
                >
                    <Text style={[styles.segmentText, tab === 'official' && styles.segmentTextActive]}>
                        {t('tours.official')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.segment, tab === 'myTours' && styles.segmentActive]}
                    onPress={() => {
                        setTab('myTours');
                        checkAuth(true);
                    }}
                >
                    <Text style={[styles.segmentText, tab === 'myTours' && styles.segmentTextActive]}>
                        {t('tours.myTours')}
                    </Text>
                </TouchableOpacity>
            </View>

            {tab === 'official' ? (
                <FlatList
                    data={officialTours}
                    keyExtractor={(item) => item.id}
                    renderItem={renderOfficialItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={styles.emptyText}>{t('tours.empty')}</Text>}
                />
            ) : !isLoggedIn ? (
                <View style={styles.loginPrompt}>
                    <LogIn size={40} color="#94a3b8" />
                    <Text style={styles.loginPromptText}>{t('tours.loginToCreate')}</Text>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => router.push('/login')}
                    >
                        <Text style={styles.loginButtonText}>{t('common.login')}</Text>
                    </TouchableOpacity>
                </View>
            ) : myToursLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#0f172a" />
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    <FlatList
                        data={myTours}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMyTourItem}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>{t('tours.noCustomTours')}</Text>
                                <Text style={styles.emptySubtext}>{t('tours.createFirstTour')}</Text>
                            </View>
                        }
                    />
                </View>
            )}

            {tab === 'myTours' && isLoggedIn && !myToursLoading && (
                <TouchableOpacity
                    style={[styles.fab, { bottom: insets.bottom + 74 }]}
                    onPress={() => router.push('/tour/create')}
                >
                    <Plus size={24} color="#fff" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerTitle: {
        fontSize: 24, fontWeight: 'bold', color: '#0f172a',
        paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12, backgroundColor: '#fff',
    },
    segmentContainer: {
        flexDirection: 'row', marginHorizontal: 20, marginVertical: 12,
        backgroundColor: '#e2e8f0', borderRadius: 10, padding: 3,
    },
    segment: {
        flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8,
    },
    segmentActive: { backgroundColor: '#0f172a' },
    segmentText: { fontSize: 14, fontWeight: '600', color: '#475569' },
    segmentTextActive: { color: '#fff' },
    listContent: { padding: 20, paddingBottom: 150 },
    tourCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 5, elevation: 3,
    },
    tourHeader: { marginBottom: 8 },
    tourTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    tourDescription: { fontSize: 14, color: '#64748b', lineHeight: 20, marginBottom: 16 },
    tourMeta: { flexDirection: 'row', gap: 16 },
    metaBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9',
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 6,
    },
    metaText: { fontSize: 13, color: '#475569', fontWeight: '500' },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#94a3b8', fontSize: 16 },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptySubtext: { textAlign: 'center', marginTop: 8, color: '#94a3b8', fontSize: 14 },
    loginPrompt: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    loginPromptText: { fontSize: 16, color: '#64748b', marginTop: 16, marginBottom: 20, textAlign: 'center' },
    loginButton: {
        backgroundColor: '#3b82f6', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12,
    },
    loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    fab: {
        position: 'absolute', right: 20,
        width: 56, height: 56, borderRadius: 28, backgroundColor: '#3b82f6',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, shadowRadius: 6, elevation: 8,
        zIndex: 20,
    },
});
