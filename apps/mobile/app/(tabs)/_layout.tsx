import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Map, List, Menu } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
    const { t } = useTranslation();

    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                tabBarActiveTintColor: '#F97316',
                tabBarInactiveTintColor: '#94A3B8',
                tabBarStyle: {
                    position: 'absolute',
                    bottom: Platform.OS === 'android' ? 36 : 24,
                    left: 20,
                    right: 20,
                    elevation: 10,
                    backgroundColor: '#ffffff',
                    borderRadius: 32,
                    height: 64,
                    paddingBottom: Platform.OS === 'android' ? 0 : 8,
                    paddingTop: Platform.OS === 'android' ? 0 : 8,
                    shadowColor: '#0C4A6E',
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
                    title: t('tabs.map'),
                    headerShown: false,
                    tabBarIcon: ({ color }) => <Map size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="tours"
                options={{
                    title: t('tabs.tours'),
                    tabBarIcon: ({ color }) => <List size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="more"
                options={{
                    title: t('tabs.more'),
                    tabBarIcon: ({ color }) => <Menu size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
