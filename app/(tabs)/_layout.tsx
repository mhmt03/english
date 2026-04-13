import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2980b9', // Seçili sekmenin rengi (Mavi)
        tabBarInactiveTintColor: 'gray', // Seçili olmayan sekmeler
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingBottom: 5,
        }
      }}>

      {/* 1. Sekme: Ing - Tr (Ana Sayfa -> index) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ing-Tr',
          tabBarIcon: ({ color }) => <Ionicons name="language" size={24} color={color} />,
        }}
      />

      {/* 2. Sekme: Tr - Ing */}
      <Tabs.Screen
        name="tr-ing"
        options={{
          title: 'Tr-Ing',
          tabBarIcon: ({ color }) => <Ionicons name="swap-horizontal" size={24} color={color} />,
        }}
      />

      {/* 3. Sekme: Kelime Düzenleme / Ekleme Sayfası */}
      <Tabs.Screen
        name="kelime-ekle"
        options={{
          title: 'Kelimeler',
          tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} />,
        }}
      />

      {/* 4. Sekme: Excel İçe/Dışa Aktarma Sayfası */}
      <Tabs.Screen
        name="excel"
        options={{
          title: 'Excel',
          tabBarIcon: ({ color }) => <Ionicons name="document-text" size={24} color={color} />,
        }}
      />

      {/* Explore sekmesi tamamen kaldırıldı */}
    </Tabs>
  );
}
