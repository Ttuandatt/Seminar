import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AudioProvider } from '../context/AudioContext';

export default function RootLayout() {
    return (
        <AudioProvider>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
                <Stack.Screen name="poi/[id]" options={{ title: 'Khám phá' }} />
                <Stack.Screen name="tour/[id]" options={{ title: 'Tour' }} />
                <Stack.Screen name="login" options={{ title: 'Đăng nhập', presentation: 'formSheet' }} />
                <Stack.Screen name="register" options={{ title: 'Đăng ký', presentation: 'formSheet' }} />
                <Stack.Screen name="forgot-password" options={{ title: 'Quên mật khẩu', presentation: 'formSheet' }} />
                <Stack.Screen name="edit-profile" options={{ title: 'Chỉnh sửa hồ sơ' }} />
                <Stack.Screen name="language" options={{ title: 'Ngôn ngữ' }} />
                <Stack.Screen name="about" options={{ title: 'Giới thiệu' }} />
            </Stack>
            <StatusBar style="auto" />
        </AudioProvider>
    );
}
