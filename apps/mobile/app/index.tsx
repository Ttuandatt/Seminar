import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Map, ArrowRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LandingScreen() {
    const router = useRouter();
    const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

    useEffect(() => {
        const checkFirstLaunch = async () => {
            const hasOnboarded = await AsyncStorage.getItem('onboarding_done');
            if (!hasOnboarded) {
                setIsFirstLaunch(true);
            } else {
                setIsFirstLaunch(false);
            }
        };
        checkFirstLaunch();
    }, []);

    const handleStart = () => {
        if (isFirstLaunch) {
            router.push('/onboarding');
        } else {
            router.replace('/(tabs)');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?q=80&w=1000&auto=format&fit=crop' }}
                style={styles.background}
                imageStyle={styles.imageStyle}
            >
                {/* Dark gradient overlay for text readability */}
                <View style={styles.overlay} />

                <View style={styles.content}>
                    <View style={styles.headerContainer}>
                        <View style={styles.logoCircle}>
                            <Map size={36} color="#0C4A6E" />
                        </View>
                        <Text style={styles.title}>GPS Tours</Text>
                        <Text style={styles.subtitle}>Khám phá thế giới qua những câu chuyện âm thanh sống động trải dài theo từng bước chân của bạn.</Text>
                    </View>

                    <View style={styles.bottomContainer}>
                        <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
                            <Text style={styles.primaryButtonText}>Bắt đầu hành trình</Text>
                            <ArrowRight size={20} color="#ffffff" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/login')}>
                            <Text style={styles.secondaryButtonText}>Tôi đã có tài khoản</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0C4A6E',
    },
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    imageStyle: {
        opacity: 0.85,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(12, 74, 110, 0.4)', // Deep Sky Blue tint
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingBottom: 48,
        paddingTop: 80,
        justifyContent: 'space-between',
        zIndex: 1,
    },
    headerContainer: {
        alignItems: 'flex-start',
        marginTop: 40,
    },
    logoCircle: {
        width: 64,
        height: 64,
        backgroundColor: '#ffffff',
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontSize: 48,
        fontWeight: '900',
        color: '#ffffff',
        marginBottom: 16,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 18,
        color: '#f8fafc',
        lineHeight: 28,
        fontWeight: '500',
        maxWidth: '90%',
    },
    bottomContainer: {
        gap: 16,
    },
    primaryButton: {
        backgroundColor: '#F97316', // Adventure Orange
        flexDirection: 'row',
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    secondaryButton: {
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    secondaryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});
