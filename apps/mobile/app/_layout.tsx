import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AudioProvider } from '../context/AudioContext';
import { LanguageProvider } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import '../i18n';
import OfflineBanner from '../components/OfflineBanner';
import { SyncManager } from '../services/syncManager';
import { MediaCleanupService } from '../services/mediaCleanupService';

function RootNavigator() {
    const { t } = useTranslation();

    return (
        <>
            <OfflineBanner />
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="device-check" options={{ headerShown: false, gestureEnabled: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
                <Stack.Screen name="poi/[id]" options={{ title: t('nav.explore') }} />
                <Stack.Screen name="tour/[id]" options={{ title: 'Tour' }} />
                <Stack.Screen name="sync-status" options={{ title: 'Dữ liệu Offline' }} />
                <Stack.Screen name="login" options={{ title: t('nav.login'), presentation: 'formSheet' }} />
                <Stack.Screen name="register" options={{ title: t('nav.register'), presentation: 'formSheet' }} />
                <Stack.Screen name="forgot-password" options={{ title: t('nav.forgotPassword'), presentation: 'formSheet' }} />
                <Stack.Screen name="reset-password" options={{ title: t('nav.resetPassword'), presentation: 'formSheet' }} />
                <Stack.Screen name="edit-profile" options={{ title: t('nav.editProfile') }} />
                <Stack.Screen name="language" options={{ title: t('nav.language') }} />
                <Stack.Screen name="about" options={{ title: t('nav.about') }} />
            </Stack>
        </>
    );
}

export default function RootLayout() {
    useEffect(() => {
        // Startup tasks: Delta sync + Media cleanup
        const startup = async () => {
            console.log('[App] Performing startup sync and cleanup...');
            await SyncManager.deltaSync();
            await MediaCleanupService.cleanupExpiredMedia();
        };
        startup();

        // Optional: Setup periodic sync every 15 minutes
        const interval = setInterval(() => {
            SyncManager.deltaSync();
        }, 15 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <LanguageProvider>
            <AudioProvider>
                <RootNavigator />
                <StatusBar style="auto" />
            </AudioProvider>
        </LanguageProvider>
    );
}
