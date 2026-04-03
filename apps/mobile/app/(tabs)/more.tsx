import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LogIn, Heart, Languages, Volume2, QrCode, Database, Info, Pencil } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { syncOfflinePois } from '../../services/database';
import { touristService } from '../../services/touristService';

export default function MoreScreen() {
    const { t } = useTranslation();
    const { lang } = useLanguage();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [autoPlay, setAutoPlay] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [userProfile, setUserProfile] = useState<{ displayName: string; email: string } | null>(null);
    const router = useRouter();

    useFocusEffect(
        React.useCallback(() => {
            checkLoginStatus();
            loadAutoPlay();
        }, [])
    );

    const loadAutoPlay = async () => {
        const saved = await AsyncStorage.getItem('autoPlayAudio');
        if (saved !== null) setAutoPlay(saved === 'true');
    };

    const handleAutoPlayChange = async (value: boolean) => {
        setAutoPlay(value);
        await AsyncStorage.setItem('autoPlayAudio', String(value));
    };

    const checkLoginStatus = async () => {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
            setIsLoggedIn(false);
            setUserProfile(null);
            return;
        }

        try {
            const profile = await touristService.getProfile();
            setUserProfile({
                displayName: profile.displayName || profile.user?.fullName || profile.fullName || 'Tourist User',
                email: profile.user?.email || profile.email || '-'
            });
            setIsLoggedIn(true);
        } catch (error: any) {
            const status = error?.response?.status;
            console.error('Failed to get profile', error);

            if (status === 401) {
                await AsyncStorage.removeItem('accessToken');
            }

            setIsLoggedIn(false);
            setUserProfile(null);
        }
    };

    const handleSyncOffline = async () => {
        setIsSyncing(true);
        try {
            const result = await syncOfflinePois();
            if (result.success) {
                Alert.alert(t('common.success'), t('more.syncSuccess', { count: result.count }));
            } else {
                Alert.alert(t('more.failed'), t('more.syncFail'));
            }
        } catch (error) {
            Alert.alert(t('common.error'), t('more.syncError'));
        } finally {
            setIsSyncing(false);
        }
    };

    const menuItems = [
        { icon: <QrCode size={20} color="#64748b" />, label: t('more.scanQr'), show: true, onPress: () => router.push('/scanner') },
        { icon: <Database size={20} color="#64748b" />, label: t('more.syncOffline'), show: true, onPress: handleSyncOffline },
        { icon: <Heart size={20} color="#64748b" />, label: t('more.favorites'), show: isLoggedIn, onPress: () => router.push('/favorites') },
        { icon: <User size={20} color="#64748b" />, label: t('more.viewHistory'), show: isLoggedIn, onPress: () => router.push('/history') },
        { icon: <Volume2 size={20} color="#64748b" />, label: t('more.autoPlay'), show: true, isSwitch: true, value: autoPlay, onValueChange: handleAutoPlayChange },
        { icon: <Languages size={20} color="#64748b" />, label: t('more.language'), valueText: t(`languageScreen.${lang}`), show: true, onPress: () => router.push('/language') },
        { icon: <Info size={20} color="#64748b" />, label: t('more.aboutApp'), show: true, onPress: () => router.push('/about') },
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('more.title')}</Text>
            </View>

            {isSyncing && (
                <View style={{ padding: 16, alignItems: 'center', backgroundColor: '#e0f2fe', marginHorizontal: 16, borderRadius: 12, marginBottom: 16 }}>
                    <ActivityIndicator size="small" color="#0284c7" />
                    <Text style={{ marginTop: 8, color: '#0284c7', fontWeight: '500' }}>{t('more.syncingOffline')}</Text>
                </View>
            )}

            {!isLoggedIn && (
                <View style={styles.authCard}>
                    <View style={styles.authIconContainer}>
                        <LogIn size={24} color="#0C4A6E" />
                    </View>
                    <View style={styles.authTextContainer}>
                        <Text style={styles.authTitle}>{t('more.login')}</Text>
                        <Text style={styles.authDesc}>{t('more.loginDesc')}</Text>
                    </View>
                    <TouchableOpacity style={styles.authButton} onPress={() => router.push('/login')}>
                        <Text style={styles.authButtonText}>{t('more.login')}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {isLoggedIn && (
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{userProfile?.displayName?.charAt(0)?.toUpperCase() || 'T'}</Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{userProfile?.displayName || 'Tourist User'}</Text>
                        <Text style={styles.profileEmail}>{userProfile?.email || '-'}</Text>
                    </View>
                    <TouchableOpacity style={styles.logoutButton} onPress={async () => {
                        await AsyncStorage.removeItem('accessToken');
                        setIsLoggedIn(false);
                        setUserProfile(null);
                    }}>
                        <Text style={styles.logoutText}>{t('more.logout')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.editProfileButton} onPress={() => router.push('/edit-profile')}>
                        <Pencil size={14} color="#3b82f6" />
                        <Text style={styles.editProfileText}>{t('more.edit')}</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Text style={styles.sectionTitle}>{t('more.settings')}</Text>

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
                                trackColor={{ false: "#e2e8f0", true: "#0C4A6E" }}
                                thumbColor={item.value ? '#F97316' : '#f4f3f4'}
                            />
                        ) : (
                            <Text style={styles.menuItemValue}>{item.valueText}</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.versionText}>GPS Tours v1.0.0</Text>
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
        borderColor: '#b5d8f0',
    },
    authIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E0F2FE',
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
        color: '#0C4A6E',
    },
    authDesc: {
        fontSize: 13,
        color: '#0284c7',
        textAlign: 'center',
        marginTop: 4,
    },
    authButton: {
        backgroundColor: '#F97316',
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
    editProfileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
    },
    editProfileText: {
        fontSize: 13,
        color: '#3b82f6',
        fontWeight: '500',
    },
    versionText: {
        textAlign: 'center' as const,
        color: '#94a3b8',
        fontSize: 12,
        marginTop: 40,
        marginBottom: 40,
    },
});
