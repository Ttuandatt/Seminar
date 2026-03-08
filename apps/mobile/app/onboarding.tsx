import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, FlatList, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MapPin, Headphones, QrCode, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        icon: MapPin,
        color: '#3b82f6',
        title: 'Chào mừng đến GPS Tours',
        description: 'Khám phá Phố Ẩm thực Vĩnh Khánh với hướng dẫn viên thông minh ngay trên điện thoại của bạn.',
    },
    {
        id: '2',
        icon: Headphones,
        color: '#8b5cf6',
        title: 'Thuyết minh tự động',
        description: 'Khi bạn đi ngang qua một địa điểm, app sẽ tự động phát audio thuyết minh. Không cần thao tác gì cả!',
    },
    {
        id: '3',
        icon: QrCode,
        color: '#10b981',
        title: 'Quét QR khi cần',
        description: 'Nếu GPS không chính xác, bạn có thể quét mã QR tại mỗi địa điểm để nghe thuyết minh ngay lập tức.',
    },
];

export default function OnboardingScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const router = useRouter();

    const finishOnboarding = async () => {
        await AsyncStorage.setItem('onboarding_done', 'true');
        router.replace('/(tabs)');
    };

    const goNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
            setCurrentIndex(currentIndex + 1);
        } else {
            finishOnboarding();
        }
    };

    const renderSlide = ({ item }: { item: typeof slides[0] }) => {
        const IconComp = item.icon;
        return (
            <View style={[styles.slide, { width }]}>
                <View style={[styles.iconCircle, { backgroundColor: item.color + '15' }]}>
                    <IconComp size={64} color={item.color} />
                </View>
                <Text style={styles.slideTitle}>{item.title}</Text>
                <Text style={styles.slideDescription}>{item.description}</Text>
            </View>
        );
    };

    const isLast = currentIndex === slides.length - 1;

    return (
        <View style={styles.container}>
            {/* Skip button */}
            <TouchableOpacity style={styles.skipButton} onPress={finishOnboarding}>
                <Text style={styles.skipText}>Bỏ qua</Text>
            </TouchableOpacity>

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
            />

            {/* Dots */}
            <View style={styles.dotsContainer}>
                {slides.map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            i === currentIndex && styles.dotActive,
                        ]}
                    />
                ))}
            </View>

            {/* Next / Start button */}
            <TouchableOpacity style={styles.nextButton} onPress={goNext}>
                {isLast ? (
                    <Text style={styles.nextButtonText}>Bắt đầu khám phá</Text>
                ) : (
                    <View style={styles.nextInner}>
                        <Text style={styles.nextButtonText}>Tiếp tục</Text>
                        <ChevronRight size={20} color="#fff" />
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingBottom: 48,
    },
    skipButton: {
        position: 'absolute',
        top: 56,
        right: 24,
        zIndex: 10,
        padding: 8,
    },
    skipText: {
        color: '#64748b',
        fontSize: 16,
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    iconCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    slideTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#0f172a',
        textAlign: 'center',
        marginBottom: 16,
    },
    slideDescription: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 26,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#e2e8f0',
        marginHorizontal: 6,
    },
    dotActive: {
        backgroundColor: '#3b82f6',
        width: 28,
    },
    nextButton: {
        backgroundColor: '#3b82f6',
        marginHorizontal: 24,
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
    },
});
