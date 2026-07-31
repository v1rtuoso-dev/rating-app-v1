import { AppButton, AppCard, Icon, RatingOption, ReasonChip, SectionTitle, StatusBadge } from '@/components/ui';
import { useSession } from '@/features/session/SessionContext';
import { CreateEvaluationPayload, evaluationsApi } from '@/services/api/evaluationsApi';
import { flightApi } from '@/services/api/flightApi';
import { reasonsApi, UnsatisfiedReason } from '@/services/api/reasonsApi';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from '@/tw';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Modal, useWindowDimensions } from 'react-native';

type Step = 'rating' | 'reasons' | 'thankyou';

const ratings = [
  { level: 4, label: 'Very Satisfied', emoji: '😍' },
  { level: 3, label: 'Satisfied', emoji: '😊' },
  { level: 2, label: 'Neutral', emoji: '😐' },
  { level: 1, label: 'Very Unsatisfied', emoji: '😞' },
];

export default function KioskScreen() {
  const router = useRouter();
  const { session, currentDevice, unlockAdmin, touchUserActivity } = useSession();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [step, setStep] = useState<Step>('rating');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<number[]>([]);
  const [apiReasons, setApiReasons] = useState<UnsatisfiedReason[]>([]);
  const [activeFlightId, setActiveFlightId] = useState<number | null>(session?.flightId ?? null);
  const [activeFlight, setActiveFlight] = useState<any>(null);

  // Admin PIN Popup State
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Fetch reasons and ensure valid active flight details
  useEffect(() => {
    (async () => {
      try {
        const fetchedReasons = await reasonsApi.getReasons();
        setApiReasons(fetchedReasons);

        const targetIdToFetch = session?.id && session.id !== 1023107 ? session.id : null;
        if (targetIdToFetch) {
          setActiveFlightId(targetIdToFetch);
          try {
            const fetched = await flightApi.getFlightById(targetIdToFetch);
            if (fetched) setActiveFlight(fetched);
          } catch {
            // Keep session values
          }
        } else if (!session?.flightNo) {
          const fetchedFlights = await flightApi.searchFlights();
          if (fetchedFlights.length > 0) {
            setActiveFlight(fetchedFlights[0]);
            const realId = fetchedFlights[0].id || fetchedFlights[0].flightId || 103240;
            setActiveFlightId(realId);
          } else {
            setActiveFlightId(103240);
          }
        }
      } catch (err) {
        console.warn('Failed to load kiosk initialization data:', err);
      }
    })();
  }, [session]);

  // Auto reset timer on Thank You step
  useEffect(() => {
    if (step === 'thankyou') {
      const timer = setTimeout(() => {
        resetForm();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const resetForm = () => {
    setSelectedRating(null);
    setSelectedReasons([]);
    setStep('rating');
  };

  const handleSelectRating = (level: number) => {
    setSelectedRating(level);
    if (level === 1) {
      setStep('reasons');
    } else {
      handleSubmit(level, []);
    }
  };

  const toggleReason = (id: number) => {
    setSelectedReasons((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (overrideRating?: number, overrideReasons?: number[]) => {
    const ratingToUse = overrideRating ?? selectedRating ?? 4;
    const reasonsToUse = overrideReasons ?? selectedReasons;
    const flightId = session?.flightId ?? (activeFlight ? Number(activeFlight.flightId || activeFlight.id) : 1022552);
    const deviceIdToSubmit = session?.deviceId || currentDevice?.id || 1;
    const counterToSubmit = session?.counter || '12';

    const payload: CreateEvaluationPayload = {
      flightId: flightId,
      staffUserId: 0,
      deviceId: deviceIdToSubmit,
      checkinCounterName: counterToSubmit,
      ratingLevel: ratingToUse,
      evaluationType: 0,
      reasonIds: reasonsToUse,
    };

    console.log('Submitting evaluation payload:', payload);

    try {
      await evaluationsApi.createEvaluation(payload);
    } catch (err) {
      console.warn('Evaluation submission exception:', err);
    }
    setStep('thankyou');
  };

  const handleAdminPinSubmit = () => {
    if (unlockAdmin(pinInput)) {
      setPinModalVisible(false);
      setPinInput('');
      setPinError('');
      touchUserActivity();
      router.push('/admin/dashboard' as never);
    } else {
      setPinError('Invalid Admin PIN.');
    }
  };

  return (
    <View className="flex-1 bg-slate-100">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 bg-slate-100"
        contentContainerClassName={`flex-grow pt-8 pb-28 w-full self-center justify-center ${isLandscape ? 'px-10 max-w-[1280px]' : 'px-6'
          }`}
      >
        {/* Top Header with HGS Logo & Lock Icon */}
        <View className="flex-row justify-between items-center mb-6">
          <Image
            source={require('@/assets/images/hgs-logo.png')}
            style={{ width: 340, height: 95, maxWidth: '80%' }}
            resizeMode="contain"
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setPinInput('');
              setPinError('');
              setPinModalVisible(true);
            }}
            className="p-2 opacity-70"
          >
            <Icon name="lock-outline" size={36} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* Title & Flight Session Header */}
        <View className="mb-6">
          <Text className="text-4xl font-black text-slate-900" style={{ lineHeight: 48 }}>Passenger Feedback</Text>
          <Text className="text-base font-semibold text-slate-500 mt-1" style={{ lineHeight: 22 }}>
            Please share your check-in experience for your active flight.
          </Text>
        </View>

        {/* Comprehensive Flight Information Card */}
        {(() => {
          const flightNo = (session?.flightNo || activeFlight?.flightNo || 'WE272').trim();
          const route = (session?.route || activeFlight?.route || 'SGN → BKK').trim();
          const counter = (session?.counter || 'Counter A').trim();
          const flightDate = (activeFlight?.flightDate || new Date().toISOString().split('T')[0]).trim();
          const flightTime = (activeFlight?.flightDateTime?.split('T')[1]?.substring(0, 5) || activeFlight?.flightTime || '10:30').trim();
          
          const rawAcno = (activeFlight?.acno || '').trim();
          const rawActp = (activeFlight?.actp || '').trim();
          const aircraft = rawAcno ? `${rawAcno}${rawActp ? ` (${rawActp})` : ''}` : (rawActp || 'A321');

          return (
            <View
              className="bg-white rounded-3xl p-6 mb-8 border border-slate-200"
              style={{ elevation: 3 }}
            >
              <View className="flex-row flex-wrap justify-between items-center gap-4">
                {/* Flight Number & Route */}
                <View className="flex-1 min-w-[200px]">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-xs font-black text-teal-700 uppercase tracking-wider">Active Flight</Text>
                  </View>
                  <Text className="text-3xl font-black text-slate-900" style={{ lineHeight: 38 }}>
                    {flightNo}
                  </Text>
                  <Text className="text-base font-bold text-teal-800 mt-0.5" style={{ lineHeight: 22 }}>
                    {route}
                  </Text>
                </View>

                {/* Counter, Departure & Aircraft Details */}
                <View className="flex-row flex-wrap items-center gap-3">
                  <View className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                    <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Check-in Location</Text>
                    <Text className="text-base font-extrabold text-slate-900">{counter}</Text>
                  </View>

                  <View className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                    <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Departure</Text>
                    <View className="flex-row items-center gap-1.5">
                      <Icon name="clock" size={18} color="#0f766e" />
                      <Text className="text-base font-bold text-slate-800">{flightTime} ({flightDate})</Text>
                    </View>
                  </View>

                  <View className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                    <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Aircraft</Text>
                    <View className="flex-row items-center gap-1.5">
                      <Icon name="flight" size={18} color="#0f766e" />
                      <Text className="text-base font-bold text-slate-800">{aircraft}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          );
        })()}

        {step === 'rating' && (
          <AppCard>
            <SectionTitle
              title="How was your service experience today?"
              subtitle="Please tap an option to submit your rating."
            />
            <View className={`mt-6 ${isLandscape ? 'flex-row gap-4' : 'gap-4'}`}>
              {ratings.map((item) => (
                <RatingOption
                  key={item.level}
                  label={item.label}
                  emoji={item.emoji}
                  selected={selectedRating === item.level}
                  onPress={() => handleSelectRating(item.level)}
                />
              ))}
            </View>
          </AppCard>
        )}

        {step === 'reasons' && (
          <AppCard>
            <SectionTitle
              title="What could we improve?"
              subtitle="Select one or more reasons that impacted your check-in experience."
            />
            <View className="flex-row flex-wrap mt-6">
              {apiReasons.map((reason) => (
                <ReasonChip
                  key={reason.id}
                  label={reason.reasonName}
                  selected={selectedReasons.includes(reason.id)}
                  onPress={() => toggleReason(reason.id)}
                />
              ))}
            </View>

            <View className="mt-8 flex-row gap-4">
              <View className="flex-1">
                <AppButton title="Back" onPress={() => setStep('rating')} variant="secondary" />
              </View>
              <View className="flex-1">
                <AppButton title="Submit Feedback" onPress={() => handleSubmit()} />
              </View>
            </View>
          </AppCard>
        )}

        {step === 'thankyou' && (
          <AppCard>
            <View className="items-center justify-center py-4 min-h-[236px]">
              <Text className="text-center mb-2" style={{ fontSize: 64, lineHeight: 72 }}>🎉</Text>
              <Text className="text-4xl font-black text-slate-900 text-center" style={{ lineHeight: 44 }}>Thank You!</Text>
              <Text className="text-base font-bold text-slate-500 text-center mt-2 max-w-[540px]" style={{ lineHeight: 22 }}>
                Your feedback helps us continuously elevate our service quality. Have a safe and pleasant flight!
              </Text>

              <View className="mt-6 w-full max-w-[340px]">
                <AppButton title="Submit Another Rating" onPress={resetForm} />
              </View>
            </View>
          </AppCard>
        )}
      </ScrollView>

      {/* Admin PIN Authentication Modal */}
      <Modal visible={pinModalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center p-6" style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}>
          <View className="bg-white rounded-3xl p-8 w-full max-w-[460px] border border-slate-200" style={{ elevation: 10 }}>
            <Text className="text-2xl font-bold text-slate-900">Admin Authentication</Text>
            <Text className="text-base text-slate-500 mt-1 mb-6">Enter Admin PIN/Password to access settings.</Text>

            <TextInput
              secureTextEntry
              keyboardType="number-pad"
              value={pinInput}
              onChangeText={setPinInput}
              placeholder="Enter PIN"
              textAlign="center"
              textAlignVertical="center"
              className="border border-slate-300 rounded-2xl p-5 bg-slate-50 text-slate-900 mb-2 text-2xl font-bold"
              style={{ textAlign: 'center' }}
            />
            {pinError ? <Text className="text-red-600 text-sm mb-4 text-center font-semibold">{pinError}</Text> : null}

            <View className="flex-row gap-4 mt-3">
              <View className="flex-1">
                <AppButton title="Cancel" onPress={() => setPinModalVisible(false)} variant="secondary" />
              </View>
              <View className="flex-1">
                <AppButton title="Unlock" onPress={handleAdminPinSubmit} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
