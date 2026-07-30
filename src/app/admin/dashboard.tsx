import React, { useEffect, useState } from 'react';
import { Modal, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppCard, MetricCard, SectionTitle, StatusBadge } from '@/components/ui';
import { useSession } from '@/features/session/SessionContext';
import { ApiEvaluation, evaluationsApi } from '@/services/api/evaluationsApi';
import { authApi } from '@/services/api/authApi';
import { theme } from '@/theme';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from '@/tw';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { session, isAdminUnlocked, isLoaded, changeAdminPin, clearSession, lockAdmin, touchUserActivity } = useSession();
  const { width, height } = useWindowDimensions();
  const isTablet = width / height >= 1.45;

  const [evaluations, setEvaluations] = useState<ApiEvaluation[]>([]);
  const [loading, setLoading] = useState(true);

  // Change PIN State
  const [pinChangeModalVisible, setPinChangeModalVisible] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeMessage, setPinChangeMessage] = useState('');

  // Auto redirect to Kiosk when Admin mode locks due to inactivity
  useEffect(() => {
    if (isLoaded && !isAdminUnlocked) {
      router.replace('/kiosk' as never);
    }
  }, [isAdminUnlocked, isLoaded]);

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

  const handleSignOut = async () => {
    try {
      await authApi.logout();
    } catch {
      // Continue cleanup
    }
    await clearSession();
    lockAdmin();
    router.replace('/admin' as never);
  };

  const handleChangePinSubmit = async () => {
    if (!newPinInput || newPinInput.trim().length < 4) {
      setPinChangeMessage('PIN must be at least 4 digits');
      return;
    }
    const success = await changeAdminPin(newPinInput);
    if (success) {
      setPinChangeMessage('✅ Admin PIN updated successfully!');
      setTimeout(() => {
        setPinChangeModalVisible(false);
        setNewPinInput('');
        setPinChangeMessage('');
      }, 1200);
    } else {
      setPinChangeMessage('Failed to update PIN');
    }
  };

  const totalReviews = evaluations.length;
  const getRatingVal = (e: ApiEvaluation) => e.ratingLevel ?? e.rating ?? 4;
  const excellentReviews = evaluations.filter((e) => getRatingVal(e) >= 4).length;
  const avgRating = totalReviews > 0 ? (evaluations.reduce((acc, e) => acc + getRatingVal(e), 0) / totalReviews).toFixed(1) : '4.0';

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
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-3xl font-extrabold text-slate-900">Operations Dashboard</Text>
            <Text className="text-sm text-slate-500 mt-1">
              Active: Flight {session?.flightNo || 'WE272'} • {session?.counter || 'Counter A'}
            </Text>
          </View>

          <View className="flex-row gap-2">
            <AppButton
              title="🔒 Kiosk"
              onPress={() => {
                lockAdmin();
                router.replace('/kiosk' as never);
              }}
              variant="ghost"
              fullWidth={false}
            />
            <AppButton
              title="🚪 Sign Out"
              onPress={handleSignOut}
              variant="secondary"
              fullWidth={false}
            />
          </View>
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
          evaluations.map((item) => {
            const ratingVal = getRatingVal(item);
            const counterText = item.checkinCounterName ? ` • ${item.checkinCounterName}` : '';
            return (
              <AppCard key={item.id} className="mb-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-base font-bold text-slate-900">
                    {item.deviceName || 'Kiosk Device'}{counterText} • Flight #{item.flightId}
                  </Text>
                  <StatusBadge
                    label={`${ratingVal}/4`}
                    color={ratingVal >= 4 ? theme.colors.success : ratingVal >= 3 ? theme.colors.primary : theme.colors.warning}
                  />
                </View>
                <Text className="text-slate-500 text-xs mt-1.5">{item.createdAt}</Text>
              </AppCard>
            );
          })
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

        <View className="mt-3">
          <AppButton
            title="🔑 Change Admin PIN"
            onPress={() => {
              setNewPinInput('');
              setPinChangeMessage('');
              setPinChangeModalVisible(true);
            }}
            variant="ghost"
          />
        </View>
      </ScrollView>

      {/* Change PIN Modal */}
      <Modal visible={pinChangeModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-slate-900/60 justify-center items-center p-6">
          <View className="bg-white rounded-3xl p-8 w-full max-w-[440px] border border-slate-200 shadow-2xl">
            <Text className="text-2xl font-bold text-slate-900">Change Admin PIN</Text>
            <Text className="text-base text-slate-500 mt-1 mb-6">Enter a new 4+ digit PIN to secure Admin Mode.</Text>

            <TextInput
              secureTextEntry
              keyboardType="number-pad"
              value={newPinInput}
              onChangeText={setNewPinInput}
              placeholder="Enter new PIN (e.g. 654321)"
              className="border border-slate-300 rounded-2xl p-5 bg-slate-50 text-slate-900 mb-3 text-center text-2xl font-bold tracking-widest"
            />
            {pinChangeMessage ? (
              <Text
                className={`text-sm mb-4 text-center font-bold ${
                  pinChangeMessage.includes('✅') ? 'text-teal-700' : 'text-red-600'
                }`}
              >
                {pinChangeMessage}
              </Text>
            ) : null}

            <View className="flex-row gap-4 mt-2">
              <View className="flex-1">
                <AppButton title="Cancel" onPress={() => setPinChangeModalVisible(false)} variant="secondary" />
              </View>
              <View className="flex-1">
                <AppButton title="Save PIN" onPress={handleChangePinSubmit} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
