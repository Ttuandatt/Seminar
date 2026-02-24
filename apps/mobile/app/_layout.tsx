import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
    return (
        <>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="poi/[id]" options={{ title: 'POI Detail' }} />
                <Stack.Screen name="tour/[id]" options={{ title: 'Tour Detail' }} />
            </Stack>
            <StatusBar style="auto" />
        </>
    );
}
