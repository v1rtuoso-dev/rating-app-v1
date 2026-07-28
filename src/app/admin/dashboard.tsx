import React from 'react';
import { useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppCard, MetricCard, SectionTitle, StatusBadge } from '@/components/ui';
import { getSummaryStats, mockEvaluations } from '@/services/mockData';
import { theme } from '@/theme';
import { ScrollView, Text, View } from '@/tw';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isTablet = width / height >= 1.45;
  const stats = getSummaryStats();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 bg-slate-100"
      contentContainerClassName={`flex-grow py-6 w-full self-center ${isTablet ? 'px-8 max-w-[980px]' : 'px-6'}`}
    >
      <View className="mb-4">
        <Text className="text-3xl font-extrabold text-slate-900">Operations dashboard</Text>
        <Text className="text-sm text-slate-500 mt-1.5">Monitor evaluations and service quality.</Text>
      </View>

      <View className="flex-row gap-3 mb-3">
        <MetricCard label="Total reviews" value={stats.total.toString()} accent={theme.colors.primary} />
        <MetricCard label="Excellent" value={stats.excellent.toString()} accent={theme.colors.success} />
      </View>
      <View className="flex-row gap-3 mb-3">
        <MetricCard label="Avg rating" value={stats.average.toString()} accent={theme.colors.warning} />
        <MetricCard label="Counter" value="3 active" accent={theme.colors.accent} />
      </View>

      <SectionTitle title="Recent evaluations" subtitle="Latest guest feedback collected by staff." />
      {mockEvaluations.map((item) => (
        <AppCard key={item.id} className="mb-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-base font-bold text-slate-900">{item.flightNo}</Text>
            <StatusBadge label={`${item.rating}/4`} color={item.rating >= 4 ? theme.colors.success : theme.colors.warning} />
          </View>
          <Text className="text-slate-500 text-xs mt-1.5">{item.counter} • {item.createdAt}</Text>
          <Text className="text-slate-800 text-sm mt-2">{item.comment}</Text>
        </AppCard>
      ))}

      <AppButton title="Manage staff accounts" onPress={() => router.push('/admin/staff' as never)} />
      <AppButton title="Back" onPress={() => router.back()} variant="secondary" />
    </ScrollView>
  );
}

