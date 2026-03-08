import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Mail, Camera } from 'lucide-react-native';
import { touristService } from '../services/touristService';

export default function EditProfileScreen() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const profile = await touristService.getProfile();
            setFullName(profile.fullName || profile.displayName || '');
            setEmail(profile.email || '');
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tải thông tin cá nhân.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!fullName.trim()) {
            Alert.alert('Lỗi', 'Tên không được để trống.');
            return;
        }
        setSaving(true);
        try {
            await touristService.updateProfile({ fullName: fullName.trim() });
            Alert.alert('Thành công', 'Cập nhật thông tin thành công.', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Không thể cập nhật thông tin.';
            Alert.alert('Lỗi', msg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                {/* Avatar placeholder */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatar}>
                        <User size={40} color="#3b82f6" />
                    </View>
                    <TouchableOpacity style={styles.changeAvatarButton}>
                        <Camera size={14} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Text style={styles.label}>Họ và tên</Text>
                    <View style={styles.inputContainer}>
                        <User size={20} color="#64748b" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập họ và tên"
                            value={fullName}
                            onChangeText={setFullName}
                        />
                    </View>

                    <Text style={styles.label}>Email</Text>
                    <View style={[styles.inputContainer, styles.disabledInput]}>
                        <Mail size={20} color="#94a3b8" style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: '#94a3b8' }]}
                            value={email}
                            editable={false}
                        />
                    </View>
                    <Text style={styles.hint}>Email không thể thay đổi</Text>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    scrollContent: { flexGrow: 1, padding: 24 },
    avatarSection: { alignItems: 'center', marginVertical: 24, position: 'relative' },
    avatar: {
        width: 96, height: 96, borderRadius: 48,
        backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center',
        borderWidth: 3, borderColor: '#3b82f6',
    },
    changeAvatarButton: {
        position: 'absolute', bottom: 0, right: '35%',
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: '#fff',
    },
    form: { width: '100%' },
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc',
        borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12,
        paddingHorizontal: 16, height: 56,
    },
    disabledInput: { backgroundColor: '#f1f5f9' },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, height: '100%', fontSize: 16, color: '#0f172a' },
    hint: { fontSize: 12, color: '#94a3b8', marginTop: 4, marginLeft: 4 },
    saveButton: {
        backgroundColor: '#3b82f6', borderRadius: 12, height: 56,
        justifyContent: 'center', alignItems: 'center', marginTop: 32,
    },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
