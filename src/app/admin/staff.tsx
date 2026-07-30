import React, { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppCard, SectionTitle, StatusBadge } from '@/components/ui';
import { AdminDrawer } from '@/components/AdminDrawer';
import { useSession } from '@/features/session/SessionContext';
import { ApiDevice, devicesApi } from '@/services/api/devicesApi';
import { theme } from '@/theme';
import { ScrollView, Text, View } from '@/tw';

export default function StaffScreen() {
  const router = useRouter();
  const { session, isAdminUnlocked, isLoaded, touchUserActivity } = useSession();
  const { width, height } = useWindowDimensions();
  const isTablet = width / height >= 1.45;

  const [devices, setDevices] = useState<ApiDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    if (isLoaded && !isAdminUnlocked && session) {
      router.replace('/kiosk' as never);
    }
  }, [isAdminUnlocked, isLoaded, session]);

  useEffect(() => {
    (async () => {
      try {
        const fetched = await devicesApi.getDevices();
        setDevices(fetched);
      } catch (err) {
        console.warn('Devices fetch error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (!isAdminUnlocked) return null;

  return (
    <View className="flex-1 bg-slate-100" onTouchStart={touchUserActivity}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 bg-slate-100"
        contentContainerClassName={`flex-grow pt-8 pb-28 w-full self-center ${isTablet ? 'px-10 max-w-[1280px]' : 'px-6'}`}
      >
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-3xl font-extrabold text-slate-900">Registered Devices & Staff</Text>
            <Text className="text-sm text-slate-500 mt-1.5">Manage deployed tablet kiosks and active devices.</Text>
          </View>

          <AppButton
            title="Admin Menu"
            icon="menu"
            onPress={() => setDrawerVisible(true)}
            variant="secondary"
            fullWidth={false}
          />
        </View>

        <SectionTitle title="Kiosk Devices" subtitle="Devices registered to record passenger ratings." />
        {loading ? (
          <Text className="text-slate-500 py-4">Loading registered devices...</Text>
        ) : (
          devices.map((device) => (
            <AppCard key={device.id} className="mb-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-base font-bold text-slate-900">{device.deviceName}</Text>
                <StatusBadge
                  label={device.status}
                  color={device.status === 'active' ? theme.colors.success : theme.colors.warning}
                />
              </View>
              <Text className="text-slate-500 text-sm mt-1.5">ID: {device.deviceIdentifier} • Last seen: {device.lastSeenAt.substring(0, 10)}</Text>
            </AppCard>
          ))
        )}
      </ScrollView>

      <AdminDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </View>
  );
}
