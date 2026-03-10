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
                tabBarActiveTintColor: '#2563EB',
                tabBarInactiveTintColor: '#94A3B8',
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    right: 16,
                    elevation: 10,
                    backgroundColor: '#ffffff',
                    borderRadius: 24,
                    height: 64,
                    paddingBottom: 8,
                    paddingTop: 8,
                    shadowColor: '#2563EB',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.15,
                    shadowRadius: 20,
                    borderTopWidth: 0,
                },
                tabBarLabelStyle: {
                    fontWeight: '600',
                    fontSize: 11,
                    marginBottom: 4,
                }
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
