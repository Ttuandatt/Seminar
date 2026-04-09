import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useNetworkStatus } from '../services/networkStatus';

export default function OfflineBanner() {
    const isOnline = useNetworkStatus();

    if (isOnline) return null;

    return (
        <View style={styles.container}>
            <WifiOff size={16} color="#FFF" style={styles.icon} />
            <Text style={styles.text}>Bạn đang ngoại tuyến — Một số tính năng có thể bị hạn chế</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#666',
        paddingVertical: 8,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginRight: 8,
    },
    text: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
});
