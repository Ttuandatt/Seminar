import React, { useEffect, useState } from 'react';
import {
    StyleSheet, View, Text, TextInput, TouchableOpacity,
    FlatList, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { publicService, Poi } from '../../services/publicService';
import { touristService } from '../../services/touristService';
import { useLanguage } from '../../context/LanguageContext';
import { Check, ChevronUp, ChevronDown, X, MapPin, Heart } from 'lucide-react-native';

type TabKey = 'nearby' | 'favorites';

export default function CreateTourScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { getPoiName } = useLanguage();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPois, setSelectedPois] = useState<Poi[]>([]);
    const [tab, setTab] = useState<TabKey>('nearby');
    const [nearbyPois, setNearbyPois] = useState<Poi[]>([]);
    const [favoritePois, setFavoritePois] = useState<Poi[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadNearbyPois();
        loadFavoritePois();
    }, []);

    const loadNearbyPois = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            const loc = await Location.getCurrentPositionAsync({});
            const data = await publicService.getNearbyPois(loc.coords.latitude, loc.coords.longitude, 2000);
            setNearbyPois(data);
        } catch (e) {
            console.error('Error loading nearby POIs:', e);
        }
    };

    const loadFavoritePois = async () => {
        try {
            const data = await touristService.getFavorites();
            setFavoritePois(data.map((f: any) => f.poi));
        } catch (e) {
            console.error('Error loading favorites:', e);
        }
    };

    const togglePoi = (poi: Poi) => {
        const exists = selectedPois.find(p => p.id === poi.id);
        if (exists) {
            setSelectedPois(prev => prev.filter(p => p.id !== poi.id));
        } else {
            if (selectedPois.length >= 15) {
                Alert.alert(t('customTour.maxStops'), t('customTour.maxStopsMsg'));
                return;
            }
            setSelectedPois(prev => [...prev, poi]);
        }
    };

    const movePoi = (index: number, direction: 'up' | 'down') => {
        const newList = [...selectedPois];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= newList.length) return;
        [newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]];
        setSelectedPois(newList);
    };

    const removePoi = (index: number) => {
        setSelectedPois(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert(t('customTour.nameRequired'));
            return;
        }
        if (selectedPois.length < 2) {
            Alert.alert(t('customTour.minStops'), t('customTour.minStopsMsg'));
            return;
        }

        setSubmitting(true);
        try {
            const tour = await touristService.createMyTour({
                name: name.trim(),
                description: description.trim() || undefined,
                poiIds: selectedPois.map(p => p.id),
            });
            router.replace(`/tour/${tour.id}?source=custom`);
        } catch (e) {
            console.error('Error creating tour:', e);
            Alert.alert(t('common.error'), t('customTour.createError'));
        } finally {
            setSubmitting(false);
        }
    };

    const currentPois = tab === 'nearby' ? nearbyPois : favoritePois;
    const selectedIds = new Set(selectedPois.map(p => p.id));

    const renderPoiItem = ({ item }: { item: Poi }) => {
        const isSelected = selectedIds.has(item.id);
        return (
            <TouchableOpacity
                style={[styles.poiCard, isSelected && styles.poiCardSelected]}
                onPress={() => togglePoi(item)}
            >
                <View style={styles.poiInfo}>
                    <Text style={styles.poiName}>{getPoiName(item)}</Text>
                    {item.distance != null && (
                        <Text style={styles.poiDistance}>{Math.round(item.distance)}m</Text>
                    )}
                </View>
                {isSelected && (
                    <View style={styles.checkIcon}>
                        <Check size={18} color="#fff" />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.headerTitle}>{t('customTour.createTitle')}</Text>

                {/* Name Input */}
                <Text style={styles.label}>{t('customTour.name')}</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder={t('customTour.namePlaceholder')}
                    maxLength={100}
                />

                {/* Description Input */}
                <Text style={styles.label}>{t('customTour.description')}</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder={t('customTour.descriptionPlaceholder')}
                    multiline
                    numberOfLines={3}
                    maxLength={500}
                />

                {/* Selected POIs */}
                {selectedPois.length > 0 && (
                    <View style={styles.selectedSection}>
                        <Text style={styles.sectionTitle}>
                            {t('customTour.selectedStops')} ({selectedPois.length}/15)
                        </Text>
                        {selectedPois.map((poi, index) => (
                            <View key={poi.id} style={styles.selectedItem}>
                                <View style={styles.orderBadge}>
                                    <Text style={styles.orderText}>{index + 1}</Text>
                                </View>
                                <Text style={styles.selectedPoiName} numberOfLines={1}>
                                    {getPoiName(poi)}
                                </Text>
                                <View style={styles.selectedActions}>
                                    <TouchableOpacity onPress={() => movePoi(index, 'up')} disabled={index === 0}>
                                        <ChevronUp size={20} color={index === 0 ? '#cbd5e1' : '#475569'} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => movePoi(index, 'down')} disabled={index === selectedPois.length - 1}>
                                        <ChevronDown size={20} color={index === selectedPois.length - 1 ? '#cbd5e1' : '#475569'} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => removePoi(index)}>
                                        <X size={20} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Tab Selector */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, tab === 'nearby' && styles.tabActive]}
                        onPress={() => setTab('nearby')}
                    >
                        <MapPin size={16} color={tab === 'nearby' ? '#fff' : '#475569'} />
                        <Text style={[styles.tabText, tab === 'nearby' && styles.tabTextActive]}>
                            {t('customTour.nearby')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, tab === 'favorites' && styles.tabActive]}
                        onPress={() => setTab('favorites')}
                    >
                        <Heart size={16} color={tab === 'favorites' ? '#fff' : '#475569'} />
                        <Text style={[styles.tabText, tab === 'favorites' && styles.tabTextActive]}>
                            {t('customTour.favorites')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* POI List */}
                <FlatList
                    data={currentPois}
                    keyExtractor={(item) => item.id}
                    renderItem={renderPoiItem}
                    scrollEnabled={false}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>{t('customTour.noPois')}</Text>
                    }
                />
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitButton, (submitting || selectedPois.length < 2 || !name.trim()) && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={submitting || selectedPois.length < 2 || !name.trim()}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>
                            {t('customTour.create')} ({selectedPois.length} {t('tours.destinations')})
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    scrollContainer: { flex: 1 },
    scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 20 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
    input: {
        backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 16,
        borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16,
    },
    textArea: { height: 80, textAlignVertical: 'top' },
    selectedSection: { marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
    selectedItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 10, padding: 12, marginBottom: 8,
        borderWidth: 1, borderColor: '#e2e8f0',
    },
    orderBadge: {
        width: 24, height: 24, borderRadius: 12, backgroundColor: '#0f172a',
        justifyContent: 'center', alignItems: 'center', marginRight: 10,
    },
    orderText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    selectedPoiName: { flex: 1, fontSize: 14, color: '#1e293b', fontWeight: '500' },
    selectedActions: { flexDirection: 'row', gap: 8 },
    tabContainer: {
        flexDirection: 'row', marginBottom: 16, backgroundColor: '#e2e8f0',
        borderRadius: 10, padding: 3,
    },
    tab: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 10, borderRadius: 8, gap: 6,
    },
    tabActive: { backgroundColor: '#0f172a' },
    tabText: { fontSize: 14, fontWeight: '600', color: '#475569' },
    tabTextActive: { color: '#fff' },
    poiCard: {
        backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderWidth: 1, borderColor: '#e2e8f0',
    },
    poiCardSelected: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
    poiInfo: { flex: 1 },
    poiName: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    poiDistance: { fontSize: 12, color: '#64748b', marginTop: 2 },
    checkIcon: {
        width: 28, height: 28, borderRadius: 14, backgroundColor: '#3b82f6',
        justifyContent: 'center', alignItems: 'center',
    },
    emptyText: { textAlign: 'center', marginTop: 30, color: '#94a3b8', fontSize: 15 },
    footer: { padding: 20, paddingBottom: 40, borderTopWidth: 1, borderTopColor: '#e2e8f0', backgroundColor: '#fff' },
    submitButton: {
        backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 12, alignItems: 'center',
    },
    submitButtonDisabled: { backgroundColor: '#94a3b8' },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
