import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, ArrowLeft } from 'lucide-react-native';
import api from '../services/api';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const router = useRouter();

    const handleReset = async () => {
        if (!email) {
            Alert.alert('Lỗi', 'Vui lòng nhập email.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
        } catch (error: any) {
            // Always show success to not reveal email existence
            setSent(true);
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <View style={styles.container}>
                <View style={styles.successContainer}>
                    <View style={styles.successCircle}>
                        <Mail size={48} color="#10b981" />
                    </View>
                    <Text style={styles.successTitle}>Email đã được gửi!</Text>
                    <Text style={styles.successText}>
                        Nếu tài khoản với email này tồn tại, bạn sẽ nhận được link đặt lại mật khẩu trong vài phút.
                    </Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Quay về Đăng nhập</Text>
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
                    <Text style={styles.title}>Quên mật khẩu?</Text>
                    <Text style={styles.subtitle}>
                        Nhập email đăng ký của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu.
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Mail size={20} color="#64748b" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <TouchableOpacity style={styles.resetButton} onPress={handleReset} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.resetButtonText}>Gửi link đặt lại</Text>
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
    resetButton: {
        backgroundColor: '#3b82f6', borderRadius: 12, height: 56,
        justifyContent: 'center', alignItems: 'center', marginTop: 8,
    },
    resetButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    // Success state
    successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    successCircle: {
        width: 100, height: 100, borderRadius: 50, backgroundColor: '#ecfdf5',
        justifyContent: 'center', alignItems: 'center', marginBottom: 24,
    },
    successTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
    successText: { fontSize: 16, color: '#64748b', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
    backButton: {
        backgroundColor: '#3b82f6', borderRadius: 12, height: 50,
        paddingHorizontal: 32, justifyContent: 'center', alignItems: 'center',
    },
    backButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
