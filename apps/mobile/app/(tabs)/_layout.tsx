import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Map, List, Menu } from 'lucide-react-native';

import { useColorScheme } from 'react-native';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: true,
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Map',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <Map size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="tours"
                options={{
                    title: 'Tours',
                    tabBarIcon: ({ color }) => <List size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="more"
                options={{
                    title: 'More',
                    tabBarIcon: ({ color }) => <Menu size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
