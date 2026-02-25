import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { publicService } from '../services/publicService';
import { XCircle } from 'lucide-react-native';

export default function ScannerScreen() {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        getCameraPermissions();
    }, []);

    const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
        setScanned(true);
        try {
            const response = await publicService.validateQr(data);
            if (response && response.valid && response.poi) {
                // Success, navigate to POI
                router.replace(`/poi/${response.poi.id}`);
            } else {
                Alert.alert("Lỗi", "Mã QR không hợp lệ hoặc không thuộc hệ thống", [
                    { text: "Thử lại", onPress: () => setScanned(false) }
                ]);
            }
        } catch (error) {
            console.error("QR Validation Error:", error);
            Alert.alert("Lỗi", "Mã QR không hợp lệ hoặc không thuộc hệ thống!", [
                { text: "Thử lại", onPress: () => setScanned(false) }
            ]);
        }
    };

    if (hasPermission === null) {
        return <View style={styles.container}><Text>Đang yêu cầu quyền sử dụng camera...</Text></View>;
    }
    if (hasPermission === false) {
        return <View style={styles.container}><Text>Không có quyền truy cập camera</Text></View>;
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

                    <Text style={styles.instructionText}>Quét mã QR tại điểm tham quan</Text>

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
