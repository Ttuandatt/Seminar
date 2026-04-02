import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { useTranslation } from 'react-i18next';
import FormFieldError from '../components/FormFieldError';
import FormBanner from '../components/FormBanner';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [banner, setBanner] = useState<string | null>(null);
    const router = useRouter();
    const { t } = useTranslation();
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);

    const validate = () => {
        const newErrors: { email?: string; password?: string } = {};
        if (!email.trim()) newErrors.email = t('login.errorEmptyField') || 'Vui lòng nhập email.';
        if (!password) newErrors.password = t('login.errorEmptyField') || 'Vui lòng nhập mật khẩu.';
        return newErrors;
    };

    const handleLogin = async () => {
        setBanner(null);
        const newErrors = validate();
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            if (newErrors.email) emailInputRef.current?.focus();
            else if (newErrors.password) passwordInputRef.current?.focus();
            return;
        }
        setLoading(true);
        try {
            const data = await authService.login({ email: email.trim(), password });
            if (data && data.accessToken) {
                await AsyncStorage.setItem('accessToken', data.accessToken);
                setTimeout(() => {
                    setEmail(''); setPassword('');
                    setErrors({});
                    setBanner(null);
                    router.back();
                }, 300);
            } else {
                setBanner(t('login.errorNoToken') || 'Đăng nhập thất bại.');
            }
        } catch (error: any) {
            console.error('Login Error:', error);
            const mapped = authService.normalizeAuthError(error);
            let fieldErrors: any = {};
            let bannerMsg: string | null = null;
            mapped.forEach(e => {
                if (e.banner) bannerMsg = e.message;
                if (e.field) fieldErrors[e.field] = e.message;
            });
            setErrors(fieldErrors);
            setBanner(bannerMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text style={styles.title}>{t('login.title')}</Text>
                    <Text style={styles.subtitle}>{t('login.subtitle')}</Text>
                </View>

                <View style={styles.form}>
                    {banner && <FormBanner message={banner} type="error" onDismiss={() => setBanner(null)} />}

                    <View style={[styles.inputContainer, errors.email && { borderColor: '#F97316' }]}> 
                        <Mail size={20} color="#64748b" style={styles.inputIcon} />
                        <TextInput
                            ref={emailInputRef}
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            returnKeyType="next"
                            onSubmitEditing={() => passwordInputRef.current?.focus()}
                            blurOnSubmit={false}
                        />
                    </View>
                    {errors.email && <FormFieldError message={errors.email} />}

                    <View style={[styles.inputContainer, errors.password && { borderColor: '#F97316' }]}> 
                        <Lock size={20} color="#64748b" style={styles.inputIcon} />
                        <TextInput
                            ref={passwordInputRef}
                            style={styles.input}
                            placeholder={t('login.passwordPlaceholder')}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            returnKeyType="done"
                            onSubmitEditing={handleLogin}
                        />
                    </View>
                    {errors.password && <FormFieldError message={errors.password} />}

                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>{t('login.loginButton')}</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/forgot-password')} style={styles.forgotContainer}>
                        <Text style={styles.forgotText}>{t('login.forgotPassword')}</Text>
                    </TouchableOpacity>

                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>{t('login.noAccount')}</Text>
                        <TouchableOpacity onPress={() => router.replace('/register')}>
                            <Text style={styles.registerLink}>{t('login.registerNow')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        lineHeight: 24,
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#0f172a',
    },
    loginButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    forgotContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
    forgotText: {
        color: '#3b82f6',
        fontSize: 14,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    registerText: {
        color: '#64748b',
        fontSize: 15,
    },
    registerLink: {
        color: '#3b82f6',
        fontSize: 15,
        fontWeight: 'bold',
    },
});
