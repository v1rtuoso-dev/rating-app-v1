import React from 'react';
import { useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppCard, SectionTitle } from '@/components/ui';
import { ScrollView, Text, View } from '@/tw';

export default function HomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 bg-slate-100"
      contentContainerClassName="flex-grow justify-center w-full self-center py-6 px-5"
    >
      <View className={`w-full gap-4 ${isLandscape ? 'flex-row items-stretch' : ''}`}>
        <View className="flex-1 justify-center min-h-[220px] p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
          <Text className="text-3xl font-extrabold text-slate-900">Customer feedback system</Text>
          <Text className="text-sm text-slate-500 mt-2">A full-screen experience for guest kiosks and internal staff.</Text>
        </View>

        <View className="flex-1 gap-3">
          <AppCard className="mb-0">
            <SectionTitle title="Choose entry point" subtitle="Launch the dedicated workflow for each audience." />
            <AppButton title="Open kiosk mode" onPress={() => router.push('/kiosk' as never)} />
            <AppButton title="Open admin mode" onPress={() => router.push('/admin' as never)} variant="secondary" />
          </AppCard>

          <AppCard className="mb-0">
            <SectionTitle title="Included flows" subtitle="Built for quick interaction on a landscape tablet." />
            <Text className="text-slate-500 mb-1.5 text-sm">• Guest rating and feedback</Text>
            <Text className="text-slate-500 mb-1.5 text-sm">• Unsatisfied reasons and comments</Text>
            <Text className="text-slate-500 mb-1.5 text-sm">• Admin login and dashboard</Text>
            <Text className="text-slate-500 mb-1.5 text-sm">• Staff account overview</Text>
          </AppCard>
        </View>
      </View>
    </ScrollView>
  );
}

