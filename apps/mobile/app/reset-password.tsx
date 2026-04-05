import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react-native';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

export default function ResetPasswordScreen() {
    const { token } = useLocalSearchParams<{ token: string }>();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const { t } = useTranslation();
    const confirmRef = useRef<TextInput>(null);

    const handleReset = async () => {
        setError('');

        if (!password || !confirmPassword) {
            setError(t('resetPassword.errorEmpty'));
            return;
        }
        if (password.length < 8) {
            setError(t('resetPassword.errorPasswordLength'));
            return;
        }
        if (password !== confirmPassword) {
            setError(t('resetPassword.errorMismatch'));
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, newPassword: password });
            setSuccess(true);
        } catch (err: any) {
            const msg = err?.response?.data?.message;
            if (msg && /expired|invalid/i.test(msg)) {
                setError(t('resetPassword.errorExpired'));
            } else {
                setError(t('resetPassword.errorGeneric'));
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <View style={styles.container}>
                <View style={styles.successContainer}>
                    <View style={styles.successCircle}>
                        <CheckCircle size={48} color="#10b981" />
                    </View>
                    <Text style={styles.successTitle}>{t('resetPassword.successTitle')}</Text>
                    <Text style={styles.successText}>{t('resetPassword.successMessage')}</Text>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => router.replace('/login')}
                    >
                        <Text style={styles.primaryButtonText}>{t('resetPassword.goToLogin')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (!token) {
        return (
            <View style={styles.container}>
                <View style={styles.successContainer}>
                    <Text style={styles.errorTitle}>{t('resetPassword.errorNoToken')}</Text>
                    <Text style={styles.successText}>{t('resetPassword.errorNoTokenDesc')}</Text>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => router.replace('/forgot-password')}
                    >
                        <Text style={styles.primaryButtonText}>{t('resetPassword.requestNew')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <TouchableOpacity style={styles.backArrow} onPress={() => router.back()}>
                    <ArrowLeft size={24} color="#0f172a" />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.title}>{t('resetPassword.title')}</Text>
                    <Text style={styles.subtitle}>{t('resetPassword.subtitle')}</Text>
                </View>

                <View style={styles.form}>
                    {error ? (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <View style={styles.inputContainer}>
                        <Lock size={20} color="#64748b" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder={t('resetPassword.newPassword')}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            returnKeyType="next"
                            onSubmitEditing={() => confirmRef.current?.focus()}
                            blurOnSubmit={false}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Lock size={20} color="#64748b" style={styles.inputIcon} />
                        <TextInput
                            ref={confirmRef}
                            style={styles.input}
                            placeholder={t('resetPassword.confirmPassword')}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            returnKeyType="done"
                            onSubmitEditing={handleReset}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleReset}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.primaryButtonText}>{t('resetPassword.submitButton')}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
    backArrow: { position: 'absolute', top: 0, left: 0, padding: 4 },
    header: { marginBottom: 32, marginTop: 24 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#64748b', lineHeight: 24 },
    form: { width: '100%' },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc',
        borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12,
        paddingHorizontal: 16, marginBottom: 16, height: 56,
    },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, height: '100%', fontSize: 16, color: '#0f172a' },
    primaryButton: {
        backgroundColor: '#3b82f6', borderRadius: 12, height: 56,
        justifyContent: 'center', alignItems: 'center', marginTop: 8,
    },
    primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    errorBanner: {
        backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
        borderRadius: 12, padding: 12, marginBottom: 16,
    },
    errorText: { color: '#dc2626', fontSize: 14, textAlign: 'center' },
    errorTitle: { fontSize: 24, fontWeight: 'bold', color: '#dc2626', marginBottom: 12 },
    // Success state
    successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    successCircle: {
        width: 100, height: 100, borderRadius: 50, backgroundColor: '#ecfdf5',
        justifyContent: 'center', alignItems: 'center', marginBottom: 24,
    },
    successTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
    successText: { fontSize: 16, color: '#64748b', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
});
