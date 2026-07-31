import React from 'react';
import { Tabs } from 'expo-router';
import { Icon } from '@/components/ui';
import { useSession } from '@/features/session/SessionContext';

export default function AdminLayout() {
  const { isAdminUnlocked } = useSession();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0f766e',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: isAdminUnlocked
          ? {
              height: 72,
              paddingTop: 8,
              paddingBottom: 10,
              backgroundColor: '#ffffff',
              borderTopWidth: 1,
              borderTopColor: '#cbd5e1',
              elevation: 8,
            }
          : { display: 'none' },
        tabBarLabelStyle: {
          fontSize: 15,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <Icon name="dashboard" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="select-flight"
        options={{
          title: 'Change Flight',
          tabBarIcon: ({ color }) => (
            <Icon name="flight" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="staff"
        options={{
          title: 'Devices & Staff',
          tabBarIcon: ({ color }) => (
            <Icon name="devices" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
