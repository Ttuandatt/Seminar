import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Check, Globe } from 'lucide-react-native';

const LANGUAGES = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', description: 'Ngôn ngữ mặc định' },
    { code: 'en', name: 'English', flag: '🇬🇧', description: 'Default language' },
];

export default function LanguageScreen() {
    const [selected, setSelected] = useState('vi');
    const router = useRouter();

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        const lang = await AsyncStorage.getItem('app_language');
        if (lang) setSelected(lang);
    };

    const selectLanguage = async (code: string) => {
        setSelected(code);
        await AsyncStorage.setItem('app_language', code);
        const name = LANGUAGES.find(l => l.code === code)?.name;
        Alert.alert('Thành công', `Đã chuyển sang ${name}`, [
            { text: 'OK', onPress: () => router.back() }
        ]);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Globe size={24} color="#3b82f6" />
                <Text style={styles.headerTitle}>Chọn ngôn ngữ</Text>
            </View>
            <Text style={styles.headerSubtitle}>
                Ngôn ngữ hiển thị cho nội dung POI và audio thuyết minh
            </Text>

            <View style={styles.list}>
                {LANGUAGES.map((lang) => (
                    <TouchableOpacity
                        key={lang.code}
                        style={[
                            styles.langItem,
                            selected === lang.code && styles.langItemActive,
                        ]}
                        onPress={() => selectLanguage(lang.code)}
                    >
                        <Text style={styles.flag}>{lang.flag}</Text>
                        <View style={styles.langInfo}>
                            <Text style={[
                                styles.langName,
                                selected === lang.code && styles.langNameActive,
                            ]}>{lang.name}</Text>
                            <Text style={styles.langDesc}>{lang.description}</Text>
                        </View>
                        {selected === lang.code && (
                            <View style={styles.checkCircle}>
                                <Check size={16} color="#fff" />
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.note}>
                Lưu ý: Một số POI có thể chưa có nội dung bằng ngôn ngữ bạn chọn. Khi đó, nội dung Tiếng Việt sẽ được hiển thị.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 24 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
    headerSubtitle: { fontSize: 14, color: '#64748b', marginBottom: 24, lineHeight: 20 },
    list: { gap: 12 },
    langItem: {
        flexDirection: 'row', alignItems: 'center', padding: 16,
        borderRadius: 14, borderWidth: 2, borderColor: '#e2e8f0',
        backgroundColor: '#fff',
    },
    langItemActive: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
    flag: { fontSize: 32, marginRight: 16 },
    langInfo: { flex: 1 },
    langName: { fontSize: 17, fontWeight: '600', color: '#0f172a', marginBottom: 2 },
    langNameActive: { color: '#3b82f6' },
    langDesc: { fontSize: 13, color: '#64748b' },
    checkCircle: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center',
    },
    note: {
        fontSize: 13, color: '#94a3b8', marginTop: 32,
        lineHeight: 20, fontStyle: 'italic', textAlign: 'center',
    },
});
