import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, Globe } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';

const LANGUAGES = [
    { code: 'vi' as const, flag: '\u{1F1FB}\u{1F1F3}', label: 'Tiếng Việt', description: 'Vietnamese (default local content)' },
    { code: 'en' as const, flag: '\u{1F1EC}\u{1F1E7}', label: 'English', description: 'English (best fallback for POI/Tour)' },
    { code: 'ja' as const, flag: '\u{1F1EF}\u{1F1F5}', label: 'Japanese', description: 'Uses translated/audio content when available' },
    { code: 'ko' as const, flag: '\u{1F1F0}\u{1F1F7}', label: 'Korean', description: 'Uses translated/audio content when available' },
    { code: 'zh-cn' as const, flag: '\u{1F1E8}\u{1F1F3}', label: 'Chinese (Simplified)', description: 'Uses translated/audio content when available' },
    { code: 'zh-tw' as const, flag: '\u{1F1F9}\u{1F1FC}', label: 'Chinese (Traditional)', description: 'Uses translated/audio content when available' },
    { code: 'fr' as const, flag: '\u{1F1EB}\u{1F1F7}', label: 'French', description: 'Uses translated/audio content when available' },
    { code: 'de' as const, flag: '\u{1F1E9}\u{1F1EA}', label: 'German', description: 'Uses translated/audio content when available' },
    { code: 'es' as const, flag: '\u{1F1EA}\u{1F1F8}', label: 'Spanish', description: 'Uses translated/audio content when available' },
    { code: 'th' as const, flag: '\u{1F1F9}\u{1F1ED}', label: 'Thai', description: 'Uses translated/audio content when available' },
    { code: 'ru' as const, flag: '\u{1F1F7}\u{1F1FA}', label: 'Russian', description: 'Uses translated/audio content when available' },
];

type LanguageCode = (typeof LANGUAGES)[number]['code'];

export default function LanguageScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { lang, setLanguage } = useLanguage();

    const selectLanguage = async (code: LanguageCode) => {
        await setLanguage(code);
        const selected = LANGUAGES.find((langItem) => langItem.code === code);
        const name = selected?.label || code.toUpperCase();
        Alert.alert(t('common.success'), t('languageScreen.changed', { name }), [
            { text: t('common.ok'), onPress: () => router.back() }
        ]);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Globe size={24} color="#3b82f6" />
                <Text style={styles.headerTitle}>{t('languageScreen.title')}</Text>
            </View>
            <Text style={styles.headerSubtitle}>
                {t('languageScreen.subtitle')}
            </Text>

            <View style={styles.list}>
                {LANGUAGES.map((item) => (
                    <TouchableOpacity
                        key={item.code}
                        style={[
                            styles.langItem,
                            lang === item.code && styles.langItemActive,
                        ]}
                        onPress={() => selectLanguage(item.code)}
                    >
                        <Text style={styles.flag}>{item.flag}</Text>
                        <View style={styles.langInfo}>
                            <Text style={[
                                styles.langName,
                                lang === item.code && styles.langNameActive,
                            ]}>{item.label}</Text>
                            <Text style={styles.langDesc}>{item.description}</Text>
                        </View>
                        {lang === item.code && (
                            <View style={styles.checkCircle}>
                                <Check size={16} color="#fff" />
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.note}>
                {t('languageScreen.note')}
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
