import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { MapPin, Github, Globe, Mail, Heart, Shield, FileText } from 'lucide-react-native';
import Constants from 'expo-constants';

const APP_VERSION = Constants.expoConfig?.version || '1.0.0';

export default function AboutScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* App Logo & Name */}
            <View style={styles.logoSection}>
                <View style={styles.logoCircle}>
                    <MapPin size={40} color="#3b82f6" />
                </View>
                <Text style={styles.appName}>GPS Tours</Text>
                <Text style={styles.version}>Phiên bản {APP_VERSION}</Text>
                <Text style={styles.tagline}>Phố Ẩm thực Vĩnh Khánh</Text>
            </View>

            {/* Description */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Giới thiệu</Text>
                <Text style={styles.cardText}>
                    GPS Tours là ứng dụng thuyết minh du lịch thông minh, tự động phát audio
                    hướng dẫn khi bạn đến gần các địa điểm tham quan tại Phố Ẩm thực Vĩnh Khánh,
                    Quận 4, TP. Hồ Chí Minh.
                </Text>
            </View>

            {/* Features */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Tính năng chính</Text>
                {[
                    '🗺️  Bản đồ tương tác với các điểm tham quan',
                    '🎧  Thuyết minh audio tự động theo GPS',
                    '📷  Quét QR tại địa điểm',
                    '📶  Hỗ trợ chế độ offline',
                    '🌐  Đa ngôn ngữ (VN/EN)',
                    '❤️  Lưu địa điểm yêu thích',
                ].map((feature, i) => (
                    <Text key={i} style={styles.featureItem}>{feature}</Text>
                ))}
            </View>

            {/* Links */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Liên kết</Text>
                <TouchableOpacity
                    style={styles.linkItem}
                    onPress={() => Linking.openURL('https://github.com/Ttuandatt/Seminar')}
                >
                    <Github size={20} color="#64748b" />
                    <Text style={styles.linkText}>GitHub Repository</Text>
                </TouchableOpacity>
            </View>

            {/* Credits */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Bản quyền</Text>
                <Text style={styles.cardText}>
                    © 2026 GPS Tours Team{'\n'}
                    Đồ án Seminar — Trường Đại học
                </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Made with{' '}
                </Text>
                <Heart size={14} color="#ef4444" />
                <Text style={styles.footerText}>{' '}in Saigon</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { padding: 24, paddingBottom: 48 },
    logoSection: { alignItems: 'center', marginBottom: 28, marginTop: 8 },
    logoCircle: {
        width: 88, height: 88, borderRadius: 44,
        backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center',
        marginBottom: 12, borderWidth: 3, borderColor: '#3b82f6',
    },
    appName: { fontSize: 28, fontWeight: 'bold', color: '#0f172a' },
    version: { fontSize: 14, color: '#64748b', marginTop: 4 },
    tagline: { fontSize: 14, color: '#3b82f6', marginTop: 4, fontWeight: '500' },
    card: {
        backgroundColor: '#fff', borderRadius: 14, padding: 20,
        marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0',
    },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
    cardText: { fontSize: 15, color: '#475569', lineHeight: 24 },
    featureItem: { fontSize: 15, color: '#475569', lineHeight: 28 },
    linkItem: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingVertical: 10,
    },
    linkText: { fontSize: 15, color: '#3b82f6', fontWeight: '500' },
    footer: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        marginTop: 16, marginBottom: 8,
    },
    footerText: { fontSize: 14, color: '#94a3b8' },
});
