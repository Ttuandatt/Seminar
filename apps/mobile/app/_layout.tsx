import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AudioProvider } from '../context/AudioContext';

export default function RootLayout() {
    return (
        <AudioProvider>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="poi/[id]" options={{ title: 'Khám phá' }} />
                <Stack.Screen name="tour/[id]" options={{ title: 'Tour' }} />
                <Stack.Screen name="login" options={{ title: 'Đăng nhập', presentation: 'formSheet' }} />
                <Stack.Screen name="register" options={{ title: 'Đăng ký', presentation: 'formSheet' }} />
            </Stack>
            <StatusBar style="auto" />
        </AudioProvider>
    );
}
