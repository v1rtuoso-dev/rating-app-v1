import { AppButton, AppCard, SectionTitle, StatusBadge } from '@/components/ui';
import { AdminDrawer } from '@/components/AdminDrawer';
import { useSession } from '@/features/session/SessionContext';
import { ApiFlight, flightApi } from '@/services/api/flightApi';
import { theme } from '@/theme';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from '@/tw';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, useWindowDimensions } from 'react-native';

export default function SelectFlightScreen() {
  const router = useRouter();
  const { session, setupSession, isAdminUnlocked, isLoaded, lockAdmin, touchUserActivity } = useSession();
  const { width, height } = useWindowDimensions();
  const isTablet = width / height >= 1.45;

  const [flights, setFlights] = useState<ApiFlight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<ApiFlight | null>(null);
  const [selectedCounter, setSelectedCounter] = useState('Counter A');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  // Auto redirect to Kiosk when Admin mode locks due to inactivity
  useEffect(() => {
    if (isLoaded && !isAdminUnlocked && session) {
      router.replace('/kiosk' as never);
    }
  }, [isAdminUnlocked, isLoaded, session]);

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

  const handleConfirmFlight = async () => {
    if (!selectedFlight) {
      setErrorMsg('⚠️ Please select a flight from the list before confirming.');
      return;
    }
    setErrorMsg('');

    const isInitialSetup = !session?.flightNo;

    await setupSession({
      id: Number(selectedFlight.id),
      flightId: Number(selectedFlight.flightId || selectedFlight.id),
      flightNo: selectedFlight.flightNo,
      route: selectedFlight.route,
      counter: selectedCounter,
      staffUser: 'HK01',
    });

    setConfirmModalVisible(false);

    if (isInitialSetup) {
      // If initial sign-in setup, launch Kiosk mode immediately
      lockAdmin();
      router.replace('/kiosk' as never);
    } else {
      // If already unlocked in Admin Mode, update flight and remain in Admin Mode
      setErrorMsg('✅ Flight updated successfully!');
      setTimeout(() => {
        setErrorMsg('');
      }, 2500);
    }
  };

  const openConfirmationPopup = (flight: ApiFlight) => {
    setSelectedFlight(flight);
    setErrorMsg('');
    setConfirmModalVisible(true);
  };

  return (
    <View className="flex-1 bg-slate-100" onTouchStart={touchUserActivity}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 bg-slate-100"
        contentContainerClassName={`flex-grow pt-8 pb-36 w-full self-center ${isTablet ? 'px-10 max-w-[1280px]' : 'px-6'}`}
      >
        {/* Header with Admin Menu button */}
        <View className="flex-row justify-between items-start mb-6">
          <View className="flex-1 pr-4">
            <Text className="text-4xl font-black text-slate-900">Session Setup</Text>
            <Text className="text-base text-slate-500 mt-1.5">
              Choose flight and counter. App will switch to passenger Kiosk Mode upon confirmation.
            </Text>
          </View>

          <AppButton
            title="Admin Menu"
            icon="menu"
            onPress={() => setDrawerVisible(true)}
            variant="secondary"
            fullWidth={false}
          />
        </View>

        {/* 1. Counter Input */}
        <SectionTitle title="1. Check-in Counter / Location" subtitle="Type counter name or number (e.g. Counter A, Desk 12)..." />
        <View className="mb-6">
          <TextInput
            value={selectedCounter}
            onChangeText={setSelectedCounter}
            placeholder="Type counter (e.g. Counter A, Gate 3)"
            className="border border-slate-300 rounded-2xl p-4 bg-white text-slate-900 text-lg font-bold shadow-sm"
          />
        </View>

        {errorMsg ? (
          <View
            className={`p-4 rounded-2xl mb-4 border ${
              errorMsg.includes('✅')
                ? 'bg-teal-50 border-teal-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <Text
              className={`font-bold text-center text-base ${
                errorMsg.includes('✅') ? 'text-teal-800' : 'text-red-700'
              }`}
            >
              {errorMsg}
            </Text>
          </View>
        ) : null}

        {/* 2. Select Flight */}
        <SectionTitle title="2. Select Active Flight" subtitle="Search or tap a flight below to activate..." />
        
        {/* Live Filter Search Input */}
        <View className="mb-4 flex-row items-center bg-white border border-slate-300 rounded-2xl px-4 py-3 shadow-sm">
          <Text className="text-xl mr-3">🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Filter by flight number or route (e.g. VN210, HAN)..."
            className="flex-1 text-slate-900 text-base font-semibold"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
              <Text className="text-slate-400 font-bold text-base">✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} className="py-10" />
        ) : filteredFlights.length === 0 ? (
          <AppCard className="py-8 items-center justify-center">
            <Text className="text-slate-500 font-semibold text-base">
              {searchQuery ? `No flights found matching "${searchQuery}"` : 'No upcoming flights scheduled.'}
            </Text>
          </AppCard>
        ) : (
          filteredFlights.map((flight) => {
            const isSelected = selectedFlight?.id === flight.id;
            const timeStr = flight.flightDateTime?.split('T')[1]?.substring(0, 5) || '10:00';
            
            return (
              <AppCard
                key={flight.id}
                className={`mb-4 border-2 ${
                  isSelected ? 'border-teal-600 bg-teal-50/20' : 'border-transparent'
                }`}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1 pr-2">
                    <Text className="text-2xl font-extrabold text-slate-900">{flight.flightNo}</Text>
                    <Text className="text-base font-bold text-teal-800 mt-0.5">{flight.route}</Text>
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
                    onPress={() => openConfirmationPopup(flight)}
                    variant={isSelected ? 'primary' : 'secondary'}
                  />
                </View>
              </AppCard>
            );
          })
        )}
      </ScrollView>

      {/* Confirm Flight Popup Modal */}
      <Modal visible={confirmModalVisible} transparent animationType="fade" onRequestClose={() => setConfirmModalVisible(false)}>
        <View className="flex-1 bg-slate-900/60 justify-center items-center p-6" onTouchStart={touchUserActivity}>
          <View className="bg-white rounded-3xl p-8 w-full max-w-[480px] border border-slate-200 shadow-2xl">
            <Text className="text-2xl font-black text-slate-900 mb-1">Confirm Flight Session</Text>
            <Text className="text-base font-semibold text-slate-500 mb-6">
              Review details before activating session.
            </Text>

            {selectedFlight && (
              <View className="bg-teal-50 border border-teal-200 rounded-2xl p-5 mb-6">
                <Text className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-3">Session Summary</Text>
                
                <View className="mb-3">
                  <Text className="text-sm font-semibold text-slate-500">Flight & Route</Text>
                  <Text className="text-xl font-black text-slate-900 mt-0.5">
                    {selectedFlight.flightNo} ({selectedFlight.route})
                  </Text>
                </View>

                <View className="mb-3">
                  <Text className="text-sm font-semibold text-slate-500">Check-in Counter / Location</Text>
                  <Text className="text-lg font-bold text-teal-800 mt-0.5">
                    {selectedCounter || 'Counter A'}
                  </Text>
                </View>

                {selectedFlight.flightDateTime ? (
                  <View>
                    <Text className="text-sm font-semibold text-slate-500">Scheduled Departure</Text>
                    <Text className="text-base font-bold text-slate-800 mt-0.5">
                      {selectedFlight.flightDateTime?.split('T')[1]?.substring(0, 5)} ({selectedFlight.flightDate})
                    </Text>
                  </View>
                ) : null}
              </View>
            )}

            <View className="flex-row gap-4 mt-2">
              <View className="flex-1">
                <AppButton title="Cancel" onPress={() => setConfirmModalVisible(false)} variant="secondary" />
              </View>
              <View className="flex-1">
                <AppButton title="Confirm Flight" onPress={handleConfirmFlight} />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <AdminDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </View>
  );
}
