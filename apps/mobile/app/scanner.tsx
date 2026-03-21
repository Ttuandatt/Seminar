import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { publicService } from '../services/publicService';
import { getOfflinePoi } from '../services/database';
import { XCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function ScannerScreen() {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const router = useRouter();
    const { t } = useTranslation();

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        getCameraPermissions();
    }, []);

    const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
        setScanned(true);

        const match = data.match(/^gpstours:poi:(.+)$/);
        if (match) {
            const poiId = match[1];

            // Check SQLite first
            const offlinePoi = getOfflinePoi(poiId);

            if (offlinePoi) {
                if (offlinePoi.hasLargeAudio === 1) {
                    // TH2: Require WiFi/Network
                    Alert.alert(
                        t('scanner.largeData'),
                        t('scanner.largeDataMsg'),
                        [
                            { text: t('common.continue'), onPress: () => router.replace(`/poi/${poiId}`) }
                        ]
                    );
                } else {
                    // TH1: Use SQLite directly
                    Alert.alert(
                        t('scanner.offlineMode'),
                        t('scanner.offlineMsg'),
                        [
                            { text: t('common.continue'), onPress: () => router.replace(`/poi/${poiId}?offline=true`) }
                        ]
                    );
                }
                return;
            }
        }

        try {
            const response = await publicService.validateQr(data);
            if (response && response.valid && response.poi) {
                // Success, navigate to POI
                router.replace(`/poi/${response.poi.id}`);
            } else {
                Alert.alert(t('common.error'), t('scanner.invalidQr'), [
                    { text: t('common.retry'), onPress: () => setScanned(false) }
                ]);
            }
        } catch (error) {
            console.error("QR Validation Error:", error);
            Alert.alert(t('common.error'), t('scanner.invalidQrNetwork'), [
                { text: t('common.retry'), onPress: () => setScanned(false) }
            ]);
        }
    };

    if (hasPermission === null) {
        return <View style={styles.container}><Text>{t('scanner.requestingPermission')}</Text></View>;
    }
    if (hasPermission === false) {
        return <View style={styles.container}><Text>{t('scanner.noPermission')}</Text></View>;
    }

    return (
        <View style={styles.container}>
            <CameraView
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
                style={StyleSheet.absoluteFillObject}
            >
                <View style={styles.overlay}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                        <XCircle size={32} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.instructionText}>{t('scanner.instruction')}</Text>

                    <View style={styles.scannerFrame}>
                        <View style={styles.cornerTopLeft} />
                        <View style={styles.cornerTopRight} />
                        <View style={styles.cornerBottomLeft} />
                        <View style={styles.cornerBottomRight} />
                    </View>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#000',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        padding: 8,
        zIndex: 10,
    },
    instructionText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 40,
        textAlign: 'center',
    },
    scannerFrame: {
        width: 250,
        height: 250,
        backgroundColor: 'transparent',
        position: 'relative',
    },
    cornerTopLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 40,
        height: 40,
        borderColor: '#fff',
        borderTopWidth: 4,
        borderLeftWidth: 4,
    },
    cornerTopRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 40,
        height: 40,
        borderColor: '#fff',
        borderTopWidth: 4,
        borderRightWidth: 4,
    },
    cornerBottomLeft: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 40,
        height: 40,
        borderColor: '#fff',
        borderBottomWidth: 4,
        borderLeftWidth: 4,
    },
    cornerBottomRight: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderColor: '#fff',
        borderBottomWidth: 4,
        borderRightWidth: 4,
    },
});
