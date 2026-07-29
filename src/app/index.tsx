import React, { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppCard, SectionTitle } from '@/components/ui';
import { useSession } from '@/features/session/SessionContext';
import { ScrollView, Text, View } from '@/tw';

export default function HomeScreen() {
  const router = useRouter();
  const { session, isLoaded } = useSession();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  useEffect(() => {
    if (isLoaded && session) {
      router.replace('/kiosk' as never);
    }
  }, [isLoaded, session]);

  if (!isLoaded) {
    return (
      <View className="flex-1 bg-slate-100 justify-center items-center">
        <Text className="text-lg font-bold text-slate-700">Loading feedback kiosk...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-100">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 bg-slate-100"
        contentContainerClassName={`flex-grow justify-center w-full self-center pt-8 pb-28 ${
          isLandscape ? 'px-10 max-w-[1280px]' : 'px-6'
        }`}
      >
        <View className={`w-full gap-4 ${isLandscape ? 'flex-row items-stretch' : ''}`}>
          <View className="flex-1 justify-center p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <Text className="text-3xl font-extrabold text-slate-900">Flight Service Kiosk</Text>
            <Text className="text-sm text-slate-500 mt-2">
              Staff preparation required before launching public passenger feedback kiosk.
            </Text>
          </View>

          <View className="flex-1 gap-3">
            <AppCard className="mb-0">
              <SectionTitle title="Staff Preparation" subtitle="Sign in to select active flight & counter." />
              <AppButton title="Staff Sign In & Setup" onPress={() => router.push('/admin' as never)} />
            </AppCard>

            <AppCard className="mb-0">
              <SectionTitle title="Operational Security" subtitle="Public Kiosk conceals staff controls." />
              <Text className="text-slate-500 mb-1.5 text-sm">• Staff signs in and selects flight/counter</Text>
              <Text className="text-slate-500 mb-1.5 text-sm">• App immediately switches to public Kiosk mode</Text>
              <Text className="text-slate-500 mb-1.5 text-sm">• Admin mode protected by corner PIN trigger</Text>
              <Text className="text-slate-500 mb-1.5 text-sm">• Automatic inactivity lock returns to Kiosk</Text>
            </AppCard>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
