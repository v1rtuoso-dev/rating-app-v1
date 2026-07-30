import { AppButton, AppCard, SectionTitle, StatusBadge } from '@/components/ui';
import { useSession } from '@/features/session/SessionContext';
import { ApiFlight, flightApi } from '@/services/api/flightApi';
import { theme } from '@/theme';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from '@/tw';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, useWindowDimensions } from 'react-native';

const counters = ['Counter A', 'Counter B', 'Counter C', 'Boarding Gate 1'];

export default function SelectFlightScreen() {
  const router = useRouter();
  const { setupSession, isAdminUnlocked, isLoaded, touchUserActivity } = useSession();
  const { width, height } = useWindowDimensions();
  const isTablet = width / height >= 1.45;

  const [flights, setFlights] = useState<ApiFlight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<ApiFlight | null>(null);
  const [selectedCounter, setSelectedCounter] = useState('Counter A');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto redirect to Kiosk when Admin mode locks due to inactivity
  useEffect(() => {
    if (isLoaded && !isAdminUnlocked) {
      router.replace('/kiosk' as never);
    }
  }, [isAdminUnlocked, isLoaded]);

  const fetchFlights = async (flightNoQuery?: string) => {
    setLoading(true);
    try {
      const fetched = await flightApi.searchFlights({
        flightNo: flightNoQuery?.trim() || undefined,
        filterNextHours: true,
      });
      setFlights(fetched);
      setSelectedFlight(null);
    } catch (err) {
      console.warn('Flight fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  // Instant real-time filtering on searchQuery keypress
  const filteredFlights = useMemo(() => {
    if (!searchQuery.trim()) return flights;
    const query = searchQuery.trim().toLowerCase();
    return flights.filter(
      (f) =>
        f.flightNo.toLowerCase().includes(query) ||
        f.route.toLowerCase().includes(query) ||
        (f.acno && f.acno.toLowerCase().includes(query))
    );
  }, [flights, searchQuery]);

  const handleConfirmAndLaunchKiosk = async () => {
    if (!selectedFlight) {
      setErrorMsg('⚠️ Please select a flight from the list before confirming.');
      return;
    }
    setErrorMsg('');

    await setupSession({
      id: Number(selectedFlight.id),
      flightId: Number(selectedFlight.flightId || selectedFlight.id),
      flightNo: selectedFlight.flightNo,
      route: selectedFlight.route,
      counter: selectedCounter,
      staffUser: 'HK01',
    });

    // Immediately switch to Kiosk Mode
    router.replace('/kiosk' as never);
  };

  return (
    <View className="flex-1 bg-slate-100" onTouchStart={touchUserActivity}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 bg-slate-100"
        contentContainerClassName={`flex-grow pt-8 pb-36 w-full self-center ${isTablet ? 'px-10 max-w-[1280px]' : 'px-6'}`}
      >
        {/* Header with Back button */}
        <View className="flex-row justify-between items-start mb-6">
          <View className="flex-1 pr-4">
            <Text className="text-4xl font-black text-slate-900">Session Setup</Text>
            <Text className="text-base text-slate-500 mt-1.5">
              Choose flight and counter. App will switch to passenger Kiosk Mode upon confirmation.
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            className="bg-white border border-slate-300 py-3 px-5 rounded-2xl shadow-sm mt-1"
          >
            <Text className="text-slate-800 font-bold text-base">Back to Dashboard</Text>
          </TouchableOpacity>
        </View>

        {/* 1. Counter Input */}
        <SectionTitle title="1. Check-in Counter / Location" subtitle="Type counter name or number (e.g. Counter A, Desk 12)..." />
        <View className="mb-6">
          <TextInput
            value={selectedCounter}
            onChangeText={setSelectedCounter}
            placeholder="Type counter (e.g. Counter A, Desk 12)..."
            className="border border-slate-300 rounded-2xl p-4 bg-white text-slate-900 text-lg font-bold shadow-sm"
          />
        </View>

        {/* 2. Flight Selection */}
        <SectionTitle
          title="2. Select Served Flight"
          subtitle="Showing active flights departing in the next 6 hours."
        />

        {/* Search Bar with Search Button */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1">
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search flight number or route (e.g. VN123, HAN)..."
              className="border border-slate-300 rounded-2xl p-4 bg-white text-slate-900 text-lg font-bold shadow-sm"
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => fetchFlights(searchQuery)}
            className="bg-teal-700 px-8 rounded-2xl justify-center items-center shadow-md"
          >
            <Text className="text-white text-lg font-bold">Search</Text>
          </TouchableOpacity>
        </View>

        {/* Loading Indicator */}
        {loading ? (
          <View className="py-12 items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-sm mb-6">
            <ActivityIndicator size="large" color="#0f766e" />
            <Text className="text-lg font-bold text-slate-800 mt-4">Loading active flight schedule...</Text>
            <Text className="text-sm text-slate-500 mt-1">Filtering flights departing within the next 6 hours</Text>
          </View>
        ) : filteredFlights.length === 0 ? (
          <View className="py-10 items-center justify-center bg-white rounded-3xl border border-slate-200 p-6 mb-6">
            <Text className="text-4xl mb-2">🔍</Text>
            <Text className="text-xl font-bold text-slate-800 text-center">No matching flights found</Text>
            <Text className="text-sm text-slate-500 text-center mt-1">
              Try searching with another flight number or date.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                fetchFlights();
              }}
              className="mt-4 py-3 px-6 bg-slate-200 rounded-xl"
            >
              <Text className="font-bold text-slate-800">Clear Search</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredFlights.map((flight) => {
            const isSelected = selectedFlight?.id === flight.id || selectedFlight?.flightId === flight.flightId;
            const timeStr = flight.flightDateTime?.split('T')[1]?.substring(0, 5) || '10:00';

            return (
              <AppCard
                key={flight.id}
                className={`mb-4 p-6 rounded-3xl ${isSelected ? 'border-2 border-teal-700 bg-cyan-50/60 shadow-md' : 'border-slate-200'
                  }`}
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    {/* Flight Number - BIG & BOLD */}
                    <Text className="text-4xl font-black text-slate-900 tracking-tight">{flight.flightNo}</Text>
                    {/* Route - BIG & BOLD */}
                    <Text className="text-2xl font-bold text-teal-800 mt-1.5">{flight.route}</Text>
                  </View>

                  {/* Status Badge */}
                  <StatusBadge
                    label={flight.status}
                    color={isSelected ? theme.colors.primary : theme.colors.warning}
                  />
                </View>

                {/* Departure Time & Date Info */}
                <View className="bg-slate-100/80 rounded-2xl p-4 my-2 flex-row flex-wrap justify-between items-center">
                  <Text className="text-lg font-bold text-slate-800">
                    🕒 Departs: <Text className="font-black text-teal-900">{timeStr}</Text> ({flight.flightDate})
                  </Text>
                  {flight.acno ? (
                    <Text className="text-base font-semibold text-slate-600">✈️ {flight.acno} ({flight.actp || 'A321'})</Text>
                  ) : null}
                </View>

                {/* Select Button */}
                <View className="mt-3">
                  <AppButton
                    title={isSelected ? '✓ Selected Flight' : 'Select Flight'}
                    onPress={() => {
                      setSelectedFlight(flight);
                      setErrorMsg('');
                    }}
                    variant={isSelected ? 'primary' : 'secondary'}
                  />
                </View>
              </AppCard>
            );
          })
        )}
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View className="bg-white border-t border-slate-200 p-5 shadow-2xl">
        <View className={`w-full self-center ${isTablet ? 'max-w-[1280px]' : ''}`}>
          <View className="flex-row justify-between items-center mb-2 px-1">
            <Text className="text-sm font-semibold text-slate-500">Selected Session:</Text>
            {selectedFlight ? (
              <Text className="text-sm font-bold text-teal-800">
                {selectedFlight.flightNo} ({selectedFlight.route}) • {selectedCounter || 'No Counter'}
              </Text>
            ) : (
              <Text className="text-sm font-bold text-amber-600">Please select a flight below</Text>
            )}
          </View>
          {errorMsg ? (
            <Text className="text-red-600 font-bold text-sm mb-2 text-center">{errorMsg}</Text>
          ) : null}
          <AppButton
            title={selectedFlight ? `Confirm & Launch Kiosk Mode (${selectedFlight.flightNo})` : 'Confirm & Launch Kiosk Mode'}
            onPress={handleConfirmAndLaunchKiosk}
            variant={selectedFlight ? 'primary' : 'secondary'}
          />
        </View>
      </View>
    </View>
  );
}
