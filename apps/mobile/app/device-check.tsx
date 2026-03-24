import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as Network from 'expo-network';
import * as Linking from 'expo-linking';
import { MapPin, Wifi, RefreshCw, Settings, CheckCircle, XCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

type CheckStatus = 'checking' | 'pass' | 'fail';

export default function DeviceCheckScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const [gpsStatus, setGpsStatus] = useState<CheckStatus>('checking');
    const [netStatus, setNetStatus] = useState<CheckStatus>('checking');
    const [checking, setChecking] = useState(false);

    const runChecks = useCallback(async () => {
        setChecking(true);
        setGpsStatus('checking');
        setNetStatus('checking');

        // Check GPS permission
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            setGpsStatus(status === 'granted' ? 'pass' : 'fail');
        } catch {
            setGpsStatus('fail');
        }

        // Check network
        try {
            const state = await Network.getNetworkStateAsync();
            setNetStatus(state.isConnected && state.isInternetReachable ? 'pass' : 'fail');
        } catch {
            setNetStatus('fail');
        }

        setChecking(false);
    }, []);

    useEffect(() => {
        runChecks();
    }, [runChecks]);

    // Auto-navigate when all pass
    useEffect(() => {
        if (gpsStatus === 'pass' && netStatus === 'pass') {
            const timer = setTimeout(() => {
                router.replace('/');
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [gpsStatus, netStatus, router]);

    const allPass = gpsStatus === 'pass' && netStatus === 'pass';

    const renderStatusIcon = (status: CheckStatus) => {
        if (status === 'checking') return <ActivityIndicator size="small" color="#94a3b8" />;
        if (status === 'pass') return <CheckCircle size={24} color="#22c55e" />;
        return <XCircle size={24} color="#ef4444" />;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0C4A6E" />

            <View style={styles.header}>
                <Text style={styles.title}>{t('deviceCheck.title')}</Text>
                <Text style={styles.subtitle}>{t('deviceCheck.subtitle')}</Text>
            </View>

            <View style={styles.cards}>
                {/* GPS Card */}
                <View style={[styles.card, gpsStatus === 'fail' && styles.cardFail]}>
                    <View style={styles.cardIcon}>
                        <MapPin size={28} color={gpsStatus === 'fail' ? '#ef4444' : '#F97316'} />
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>{t('deviceCheck.gps')}</Text>
                        <Text style={styles.cardDesc}>
                            {gpsStatus === 'checking' ? t('deviceCheck.checking') :
                                gpsStatus === 'pass' ? t('deviceCheck.gpsOk') :
                                    t('deviceCheck.gpsFail')}
                        </Text>
                    </View>
                    {renderStatusIcon(gpsStatus)}
                </View>

                {/* Network Card */}
                <View style={[styles.card, netStatus === 'fail' && styles.cardFail]}>
                    <View style={styles.cardIcon}>
                        <Wifi size={28} color={netStatus === 'fail' ? '#ef4444' : '#F97316'} />
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>{t('deviceCheck.internet')}</Text>
                        <Text style={styles.cardDesc}>
                            {netStatus === 'checking' ? t('deviceCheck.checking') :
                                netStatus === 'pass' ? t('deviceCheck.internetOk') :
                                    t('deviceCheck.internetFail')}
                        </Text>
                    </View>
                    {renderStatusIcon(netStatus)}
                </View>
            </View>

            {allPass && (
                <View style={styles.successBanner}>
                    <CheckCircle size={20} color="#22c55e" />
                    <Text style={styles.successText}>{t('deviceCheck.allPass')}</Text>
                </View>
            )}

            {!allPass && !checking && (
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.retryButton} onPress={runChecks}>
                        <RefreshCw size={20} color="#ffffff" />
                        <Text style={styles.retryText}>{t('deviceCheck.retry')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingsButton} onPress={() => Linking.openSettings()}>
                        <Settings size={20} color="#F97316" />
                        <Text style={styles.settingsText}>{t('deviceCheck.openSettings')}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0C4A6E',
        paddingHorizontal: 24,
        paddingTop: 80,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#94a3b8',
        lineHeight: 24,
    },
    cards: {
        gap: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    cardFail: {
        borderColor: 'rgba(239,68,68,0.4)',
        backgroundColor: 'rgba(239,68,68,0.1)',
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 13,
        color: '#94a3b8',
    },
    successBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 32,
        paddingVertical: 16,
        backgroundColor: 'rgba(34,197,94,0.15)',
        borderRadius: 12,
    },
    successText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#22c55e',
    },
    actions: {
        marginTop: 32,
        gap: 12,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#F97316',
        height: 56,
        borderRadius: 16,
    },
    retryText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    settingsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        height: 56,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(249,115,22,0.4)',
        backgroundColor: 'rgba(249,115,22,0.1)',
    },
    settingsText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F97316',
    },
});
