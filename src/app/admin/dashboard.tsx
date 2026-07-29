import React, { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppCard, MetricCard, SectionTitle, StatusBadge } from '@/components/ui';
import { useSession } from '@/features/session/SessionContext';
import { ApiEvaluation, evaluationsApi } from '@/services/api/evaluationsApi';
import { theme } from '@/theme';
import { ScrollView, Text, View } from '@/tw';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { session, isAdminUnlocked, lockAdmin, touchUserActivity } = useSession();
  const { width, height } = useWindowDimensions();
  const isTablet = width / height >= 1.45;

  const [evaluations, setEvaluations] = useState<ApiEvaluation[]>([]);
  const [loading, setLoading] = useState(true);

  // If Admin mode is locked, auto redirect to Kiosk
  useEffect(() => {
    if (!isAdminUnlocked) {
      router.replace('/kiosk' as never);
    }
  }, [isAdminUnlocked]);

  useEffect(() => {
    (async () => {
      try {
        const fetched = await evaluationsApi.getEvaluations();
        setEvaluations(fetched);
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalReviews = evaluations.length;
  const excellentReviews = evaluations.filter((e) => e.rating >= 4).length;
  const avgRating = totalReviews > 0 ? (evaluations.reduce((acc, e) => acc + e.rating, 0) / totalReviews).toFixed(1) : '4.0';

  if (!isAdminUnlocked) {
    return (
      <View className="flex-1 bg-slate-100 justify-center items-center p-6">
        <Text className="text-xl font-bold text-slate-900 mb-2">Admin Session Locked</Text>
        <Text className="text-sm text-slate-500 mb-4">Redirecting to passenger Kiosk Mode...</Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-slate-100"
      onTouchStart={touchUserActivity}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 bg-slate-100"
        contentContainerClassName={`flex-grow pt-8 pb-28 w-full self-center ${isTablet ? 'px-10 max-w-[1280px]' : 'px-6'}`}
      >
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-3xl font-extrabold text-slate-900">Operations Dashboard</Text>
            <Text className="text-sm text-slate-500 mt-1">
              Active: Flight {session?.flightNo || 'VN210'} • {session?.counter || 'Counter A'}
            </Text>
          </View>

          <AppButton
            title="🔒 Return & Lock Kiosk"
            onPress={() => {
              lockAdmin();
              router.replace('/kiosk' as never);
            }}
            variant="ghost"
            fullWidth={false}
          />
        </View>

        <View className="flex-row gap-3 mb-3">
          <MetricCard label="Total Reviews" value={totalReviews.toString()} accent={theme.colors.primary} />
          <MetricCard label="Excellent" value={excellentReviews.toString()} accent={theme.colors.success} />
        </View>
        <View className="flex-row gap-3 mb-3">
          <MetricCard label="Avg Rating" value={avgRating} accent={theme.colors.warning} />
          <MetricCard label="Session Status" value="Active" accent={theme.colors.accent} />
        </View>

        <SectionTitle title="Recent Passenger Feedback" subtitle="Live feed from deployed kiosk devices." />
        {loading ? (
          <Text className="text-slate-500 py-4">Loading evaluation records...</Text>
        ) : (
          evaluations.map((item) => (
            <AppCard key={item.id} className="mb-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-base font-bold text-slate-900">
                  {item.deviceName || 'Kiosk Device'} • Flight #{item.flightId}
                </Text>
                <StatusBadge
                  label={`${item.rating}/4`}
                  color={item.rating >= 4 ? theme.colors.success : theme.colors.warning}
                />
              </View>
              <Text className="text-slate-500 text-xs mt-1.5">{item.createdAt}</Text>
              {item.comment ? <Text className="text-slate-800 text-sm mt-2">"{item.comment}"</Text> : null}
            </AppCard>
          ))
        )}

        <View className="mt-4 flex-row gap-3">
          <View className="flex-1">
            <AppButton title="Manage Staff & Devices" onPress={() => router.push('/admin/staff' as never)} />
          </View>
          <View className="flex-1">
            <AppButton
              title="Change Flight / Session"
              onPress={() => router.push('/admin/select-flight' as never)}
              variant="secondary"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
