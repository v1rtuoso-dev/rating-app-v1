import { AppButton, AppCard, SectionTitle, StatusBadge } from '@/components/ui';
import { useSession } from '@/features/session/SessionContext';
import { ApiFlight, flightApi } from '@/services/api/flightApi';
import { theme } from '@/theme';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from '@/tw';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';

const counters = ['Counter A', 'Counter B', 'Counter C', 'Boarding Gate 1'];

export default function SelectFlightScreen() {
  const router = useRouter();
  const { setupSession } = useSession();
  const { width, height } = useWindowDimensions();
  const isTablet = width / height >= 1.45;

  const [flights, setFlights] = useState<ApiFlight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<ApiFlight | null>(null);
  const [selectedCounter, setSelectedCounter] = useState('Counter A');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchFlights = async (flightNo?: string) => {
    setLoading(true);
    try {
      const fetched = await flightApi.searchFlights({ flightNo: flightNo?.trim() || undefined });
      setFlights(fetched);
      if (fetched.length > 0) {
        setSelectedFlight(fetched[0]);
      }
    } catch (err) {
      console.warn('Flight fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const handleConfirmAndLaunchKiosk = async () => {
    if (!selectedFlight) return;

    await setupSession({
      flightId: selectedFlight.flightId || selectedFlight.id,
      flightNo: selectedFlight.flightNo,
      route: selectedFlight.route,
      counter: selectedCounter,
      staffUser: 'HK01',
    });

    // Immediately switch to Kiosk Mode
    router.replace('/kiosk' as never);
  };

  return (
    <View className="flex-1 bg-slate-100">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 bg-slate-100"
        contentContainerClassName={`flex-grow pt-8 pb-28 w-full self-center ${isTablet ? 'px-10 max-w-[1280px]' : 'px-6'}`}
      >
        <View className="mb-4">
          <Text className="text-3xl font-extrabold text-slate-900">Session Setup</Text>
          <Text className="text-sm text-slate-500 mt-1.5">
            Choose flight and counter. App will switch to passenger Kiosk Mode upon confirmation.
          </Text>
        </View>

        <SectionTitle title="1. Select Check-in Counter" subtitle="Where is this tablet deployed?" />
        <View className="flex-row flex-wrap mb-4">
          {counters.map((c) => {
            const isSel = selectedCounter === c;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setSelectedCounter(c)}
                className={`py-3 px-4 rounded-xl mr-2 mb-2 border ${isSel ? 'bg-teal-700 border-teal-700' : 'bg-white border-slate-200'
                  }`}
              >
                <Text className={`font-semibold ${isSel ? 'text-white' : 'text-slate-900'}`}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <SectionTitle title="2. Select Served Flight" subtitle="Filtered for today's flight schedule." />

        <View className="flex-row gap-2 mb-4">
          <View className="flex-1">
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search flight number (e.g. VN123)..."
              className="border border-slate-200 rounded-xl p-3 bg-white text-slate-900"
            />
          </View>
          <TouchableOpacity
            onPress={() => fetchFlights(searchQuery)}
            className="bg-teal-700 px-5 rounded-xl justify-center items-center"
          >
            <Text className="text-white font-bold">Search</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <Text className="text-slate-500 py-4">Loading flight schedule...</Text>
        ) : (
          flights.map((flight) => {
            const selected = selectedFlight?.id === flight.id;

            return (
              <AppCard key={flight.id} className={`mb-3 ${selected ? 'border-teal-700 border-2 bg-teal-50/20' : ''}`}>
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-lg font-bold text-slate-900">{flight.flightNo}</Text>
                    <Text className="text-slate-500 text-sm mt-1">{flight.route}</Text>
                  </View>
                  <StatusBadge label={flight.status} color={selected ? theme.colors.primary : theme.colors.warning} />
                </View>
                <Text className="mt-2.5 mb-3 text-slate-500 text-sm">
                  {flight.flightDate} • {flight.flightDateTime?.split('T')[1]?.substring(0, 5) || '10:00'}
                </Text>
                <AppButton
                  title={selected ? '✓ Selected Flight' : 'Select Flight'}
                  onPress={() => setSelectedFlight(flight)}
                  variant={selected ? 'primary' : 'secondary'}
                />
              </AppCard>
            );
          })
        )}

        <View className="mt-4">
          <AppButton title="🚀 Confirm & Launch Kiosk Mode" onPress={handleConfirmAndLaunchKiosk} />
          <AppButton title="Back" onPress={() => router.back()} variant="secondary" />
        </View>
      </ScrollView>
    </View>
  );
}
