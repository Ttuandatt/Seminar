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
                    bottom: 24,
                    left: 20,
                    right: 20,
                    elevation: 10,
                    backgroundColor: '#ffffff',
                    borderRadius: 32,
                    height: 64,
                    paddingBottom: Platform.OS === 'android' ? 0 : 8,
                    paddingTop: Platform.OS === 'android' ? 0 : 8,
                    shadowColor: '#2563EB',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.15,
                    shadowRadius: 20,
                    borderTopWidth: 0,
                },
                tabBarItemStyle: {
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingTop: Platform.OS === 'android' ? 12 : 0,
                },
                tabBarLabelStyle: {
                    fontWeight: '600',
                    fontSize: 11,
                    marginBottom: Platform.OS === 'android' ? 12 : 4,
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
