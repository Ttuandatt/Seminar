import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshCw, Trash2, Database, ShieldCheck } from 'lucide-react-native';
import { SyncManager } from '../services/syncManager';
import { getSyncMetadata, getAllOfflinePois } from '../services/database';
import { MediaCleanupService } from '../services/mediaCleanupService';

export default function SyncStatusScreen() {
    const [lastSync, setLastSync] = useState<string | null>(null);
    const [poiCount, setPoiCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = () => {
        setLastSync(getSyncMetadata('lastSyncTimestamp'));
        setPoiCount(getAllOfflinePois().length);
    };

    const handleSyncNow = async () => {
        setIsSyncing(true);
        const result = await SyncManager.deltaSync();
        setIsSyncing(false);
        if (result.success) {
            loadStats();
            Alert.alert('Thành công', `Đã đồng bộ ${result.poisCount} POIs và ${result.toursCount} Tours.`);
        } else {
            Alert.alert('Lỗi', 'Không thể đồng bộ. Vui lòng kiểm tra kết nối mạng.');
        }
    };

    const handleCleanup = async () => {
        const deleted = await MediaCleanupService.cleanupExpiredMedia();
        Alert.alert('Dọn dẹp', `Đã xóa ${deleted} tệp media hết hạn.`);
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Chưa từng đồng bộ';
        const date = new Date(dateStr);
        return date.toLocaleString('vi-VN');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scroll}>
                <View style={styles.header}>
                    <Text style={styles.title}>Quản lý dữ liệu Offline</Text>
                    <Text style={styles.subtitle}>Dữ liệu được lưu trữ trực tiếp trên thiết bị của bạn để sử dụng khi không có mạng.</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.statRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Đồng bộ lần cuối</Text>
                            <Text style={styles.statValue}>{formatDate(lastSync)}</Text>
                        </View>
                        <TouchableOpacity 
                            style={[styles.syncBtn, isSyncing && styles.disabledBtn]} 
                            onPress={handleSyncNow}
                            disabled={isSyncing}
                        >
                            <RefreshCw size={20} color="#FFF" style={isSyncing && styles.spin} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thống kê dữ liệu</Text>
                    
                    <View style={styles.row}>
                        <Database size={20} color="#6B7280" />
                        <Text style={styles.rowText}>Tổng số địa điểm (POIs): {poiCount}</Text>
                    </View>

                    <View style={styles.row}>
                        <ShieldCheck size={20} color="#6B7280" />
                        <Text style={styles.rowText}>Chế độ bảo vệ dữ liệu: Đang bật</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Công cụ</Text>
                    
                    <TouchableOpacity style={styles.actionBtn} onPress={handleCleanup}>
                        <RefreshCw size={18} color="#374151" style={{ marginRight: 12 }} />
                        <View>
                            <Text style={styles.actionTitle}>Dọn dẹp cache hết hạn</Text>
                            <Text style={styles.actionDesc}>Xóa ảnh và video cũ để giải phóng bộ nhớ.</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionBtn, styles.dangerBtn]} onPress={() => Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa toàn bộ dữ liệu offline?')}>
                        <Trash2 size={18} color="#EF4444" style={{ marginRight: 12 }} />
                        <View>
                            <Text style={[styles.actionTitle, { color: '#EF4444' }]}>Xóa toàn bộ dữ liệu</Text>
                            <Text style={styles.actionDesc}>Gỡ bỏ toàn bộ POI và media đã tải về.</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scroll: {
        flex: 1,
    },
    header: {
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
        lineHeight: 20,
    },
    card: {
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statItem: {
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginTop: 4,
    },
    syncBtn: {
        backgroundColor: '#3B82F6',
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledBtn: {
        backgroundColor: '#93C5FD',
    },
    section: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    rowText: {
        marginLeft: 12,
        color: '#4B5563',
        fontSize: 15,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    dangerBtn: {
        borderColor: '#FEE2E2',
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
    },
    actionDesc: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    spin: {
        // Rotational animation would be added here in real CSS/RN
    }
});
