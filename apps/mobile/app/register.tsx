import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, User } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { useTranslation } from 'react-i18next';
import FormFieldError from '../components/FormFieldError';
import FormBanner from '../components/FormBanner';

export default function RegisterScreen() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string }>({});
    const [banner, setBanner] = useState<string | null>(null);
    const router = useRouter();
    const { t } = useTranslation();
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);

    const validate = () => {
        const newErrors: { fullName?: string; email?: string; password?: string } = {};
        if (!fullName.trim()) newErrors.fullName = t('register.errorEmptyField') || 'Vui lòng nhập họ tên.';
        if (!email.trim()) newErrors.email = t('register.errorEmptyField') || 'Vui lòng nhập email.';
        if (!password) newErrors.password = t('register.errorEmptyField') || 'Vui lòng nhập mật khẩu.';
        const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
        if (password && !passRegex.test(password)) newErrors.password = t('register.errorPassword') || 'Mật khẩu phải có chữ hoa, chữ thường và số.';
        if (password && password.length < 8) newErrors.password = t('register.errorPasswordLength') || 'Mật khẩu tối thiểu 8 ký tự.';
        return newErrors;
    };

    const handleRegister = async () => {
        setBanner(null);
        const newErrors = validate();
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            // Focus first error field
            if (newErrors.fullName) return;
            if (newErrors.email) emailInputRef.current?.focus();
            if (newErrors.password) passwordInputRef.current?.focus();
            return;
        }
        setLoading(true);
        try {
            const data = await authService.register({ fullName: fullName.trim(), email: email.trim(), password });
            // Save token if returned by backend
            if (data?.accessToken) {
                await AsyncStorage.setItem('accessToken', data.accessToken);
            }
            setTimeout(() => {
                setFullName(''); setEmail(''); setPassword('');
                setErrors({});
                setBanner(null);
                // Navigate directly to main tabs (not login) for better iOS UX
                router.replace('/(tabs)');
            }, 300);
        } catch (error: any) {
            console.error('Register Error:', error);
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
                    <Text style={styles.title}>{t('register.title')}</Text>
                    <Text style={styles.subtitle}>{t('register.subtitle')}</Text>
                </View>

                <View style={styles.form}>
                    {banner && <FormBanner message={banner} type="error" onDismiss={() => setBanner(null)} />}

                    <View style={[styles.inputContainer, errors.fullName && { borderColor: '#F97316' }]}> 
                        <User size={20} color="#64748b" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder={t('register.fullNamePlaceholder')}
                            value={fullName}
                            onChangeText={setFullName}
                            autoCapitalize="words"
                            returnKeyType="next"
                            onSubmitEditing={() => emailInputRef.current?.focus()}
                            blurOnSubmit={false}
                        />
                    </View>
                    {errors.fullName && <FormFieldError message={errors.fullName} />}

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
                    {errors.email && <FormFieldError message={errors.email} actionLabel={errors.email === 'Email đã được sử dụng.' ? 'Đăng nhập' : undefined} onAction={errors.email === 'Email đã được sử dụng.' ? () => router.replace('/login') : undefined} />}

                    <View style={[styles.inputContainer, errors.password && { borderColor: '#F97316' }]}> 
                        <Lock size={20} color="#64748b" style={styles.inputIcon} />
                        <TextInput
                            ref={passwordInputRef}
                            style={styles.input}
                            placeholder={t('register.passwordPlaceholder')}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            returnKeyType="done"
                            onSubmitEditing={handleRegister}
                        />
                    </View>
                    {errors.password && <FormFieldError message={errors.password} />}

                    <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.registerButtonText}>{t('register.registerButton')}</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>{t('register.hasAccount')}</Text>
                        <TouchableOpacity onPress={() => router.replace('/login')}>
                            <Text style={styles.loginLink}>{t('register.loginNow')}</Text>
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
    registerButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    loginText: {
        color: '#64748b',
        fontSize: 15,
    },
    loginLink: {
        color: '#3b82f6',
        fontSize: 15,
        fontWeight: 'bold',
    },
});
