import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LogIn, Heart, Settings, Languages, Volume2, QrCode } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function MoreScreen() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [autoPlay, setAutoPlay] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        const token = await AsyncStorage.getItem('accessToken');
        setIsLoggedIn(!!token);
    };

    const menuItems = [
        { icon: <QrCode size={20} color="#64748b" />, label: 'Quét mã QR địa điểm', show: true, onPress: () => router.push('/scanner') },
        { icon: <Heart size={20} color="#64748b" />, label: 'Địa điểm yêu thích', show: isLoggedIn, onPress: () => router.push('/favorites') },
        { icon: <Volume2 size={20} color="#64748b" />, label: 'Tự động phát audio', show: true, isSwitch: true, value: autoPlay, onValueChange: setAutoPlay },
        { icon: <Languages size={20} color="#64748b" />, label: 'Ngôn ngữ', valueText: 'Tiếng Việt', show: true },
        { icon: <User size={20} color="#64748b" />, label: 'Lịch sử xem', show: isLoggedIn, onPress: () => router.push('/history') },
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Cá nhân</Text>
            </View>

            {!isLoggedIn && (
                <View style={styles.authCard}>
                    <View style={styles.authIconContainer}>
                        <LogIn size={24} color="#3b82f6" />
                    </View>
                    <View style={styles.authTextContainer}>
                        <Text style={styles.authTitle}>Đăng nhập</Text>
                        <Text style={styles.authDesc}>Để lưu điểm yêu thích và lịch sử trải nghiệm</Text>
                    </View>
                    <TouchableOpacity style={styles.authButton}>
                        <Text style={styles.authButtonText}>Đăng nhập</Text>
                    </TouchableOpacity>
                </View>
            )}

            {isLoggedIn && (
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>T</Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>Tourist User</Text>
                        <Text style={styles.profileEmail}>tourist@gpstours.com</Text>
                    </View>
                    <TouchableOpacity style={styles.logoutButton} onPress={async () => {
                        await AsyncStorage.removeItem('accessToken');
                        setIsLoggedIn(false);
                    }}>
                        <Text style={styles.logoutText}>Đăng xuất</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Text style={styles.sectionTitle}>Cài đặt & Tiện ích</Text>

            <View style={styles.menuContainer}>
                {menuItems.filter(item => item.show).map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.menuItem, index === 0 && styles.firstMenuItem]}
                        disabled={item.isSwitch && !item.onPress}
                        onPress={item.onPress ? item.onPress : undefined}
                    >
                        <View style={styles.menuItemLeft}>
                            {item.icon}
                            <Text style={styles.menuItemLabel}>{item.label}</Text>
                        </View>

                        {item.isSwitch ? (
                            <Switch
                                value={item.value}
                                onValueChange={item.onValueChange}
                                trackColor={{ false: "#e2e8f0", true: "#3b82f6" }}
                            />
                        ) : (
                            <Text style={styles.menuItemValue}>{item.valueText}</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.versionText}>Phiên bản 1.0.0 (POC)</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    authCard: {
        backgroundColor: '#eff6ff',
        margin: 20,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#bfdbfe',
    },
    authIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#dbeafe',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    authTextContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    authTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e3a8a',
    },
    authDesc: {
        fontSize: 13,
        color: '#3b82f6',
        textAlign: 'center',
        marginTop: 4,
    },
    authButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    authButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
    profileCard: {
        backgroundColor: '#fff',
        margin: 20,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#475569',
    },
    profileInfo: {
        flex: 1,
        marginLeft: 16,
    },
    profileName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    profileEmail: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
    },
    logoutButton: {
        padding: 8,
    },
    logoutText: {
        color: '#ef4444',
        fontSize: 13,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
        marginLeft: 20,
        marginBottom: 8,
        marginTop: 10,
    },
    menuContainer: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#e2e8f0',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderColor: '#f1f5f9',
    },
    firstMenuItem: {
        borderTopWidth: 0,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuItemLabel: {
        fontSize: 16,
        color: '#334155',
    },
    menuItemValue: {
        fontSize: 15,
        color: '#94a3b8',
    },
    versionText: {
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: 12,
        marginTop: 40,
        marginBottom: 40,
    },
});
