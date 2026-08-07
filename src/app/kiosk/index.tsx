import { AppButton, Icon, ReasonChip } from '@/components/ui';
import { useSession } from '@/features/session/SessionContext';
import { useLocale } from '@/i18n';
import { CreateEvaluationPayload, evaluationsApi } from '@/services/api/evaluationsApi';
import { flightApi } from '@/services/api/flightApi';
import { reasonsApi, UnsatisfiedReason } from '@/services/api/reasonsApi';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from '@/tw';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, Modal, useWindowDimensions } from 'react-native';

type Step = 'rating' | 'reasons' | 'thankyou';

// Floating animated rating emoji component
function FloatingEmoji({
  emoji,
  onPress,
  delay = 0,
}: {
  emoji: string;
  onPress: () => void;
  delay?: number;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Gentle floating loop animation
    const floatingAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(translateY, {
          toValue: -14,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    );
    floatingAnimation.start();
    return () => floatingAnimation.stop();
  }, [delay]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 1.3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className="items-center justify-center flex-1 py-2"
    >
      <Animated.Text
        style={{
          fontSize: 195,
          lineHeight: 215,
          textAlign: 'center',
          transform: [{ translateY }, { scale }],
        }}
      >
        {emoji}
      </Animated.Text>
    </TouchableOpacity>
  );
}

export default function KioskScreen() {
  const router = useRouter();
  const { session, currentDevice, unlockAdmin, touchUserActivity } = useSession();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const { locale, toggleLocale, t } = useLocale();

  const ratings = [
    { level: 4, emoji: '😍' },
    { level: 3, emoji: '😊' },
    { level: 2, emoji: '😐' },
    { level: 1, emoji: '😞' },
  ];

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

  const [reasonsActivityKey, setReasonsActivityKey] = useState(0);

  // Auto reset timer on Thank You step
  useEffect(() => {
    if (step === 'thankyou') {
      const timer = setTimeout(() => {
        resetForm();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Auto submit timer on Reasons step after 15s of inactivity
  useEffect(() => {
    if (step === 'reasons') {
      const timer = setTimeout(() => {
        console.log('Inactivity timeout on reasons step: auto-submitting evaluation...');
        handleSubmit(selectedRating ?? 1, selectedReasons);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [step, selectedReasons, selectedRating, reasonsActivityKey]);

  const resetReasonsTimer = () => {
    setReasonsActivityKey((prev) => prev + 1);
  };

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
    resetReasonsTimer();
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
      setPinError(t('invalidPin'));
    }
  };

  const flightNo = (session?.flightNo || activeFlight?.flightNo || 'WE272').trim();
  const route = (session?.route || activeFlight?.route || 'SGN → BKK').trim();
  const flightDate = (activeFlight?.flightDate || new Date().toISOString().split('T')[0]).trim();
  const flightTime = (
    activeFlight?.flightDateTime?.split('T')[1]?.substring(0, 5) ||
    activeFlight?.flightTime ||
    '10:30'
  ).trim();

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 bg-white"
        contentContainerClassName={`flex-grow pt-4 pb-20 w-full self-center justify-between ${isLandscape ? 'px-10 max-w-[1280px]' : 'px-6'
          }`}
      >
        {/* Top Header with HGS Logo (Left), Centered Passenger Feedback Title (Center), Language Toggle & Lock Icon (Right) */}
        <View className="flex-row items-center justify-between pb-5 border-b border-slate-100 mb-6">
          {/* Left: HGS Ground Handling Logo */}
          <View className="w-[220px] justify-center">
            <Image
              source={require('@/assets/images/hgs-logo.png')}
              style={{ width: 190, height: 64 }}
              resizeMode="contain"
            />
          </View>

          {/* Center: Passenger Feedback Title (2-line multiline) */}
          <View className="flex-1 items-center justify-center px-2">
            {step === 'rating' && (
              <Text className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight text-center" style={{ lineHeight: 52 }}>
                {t('passengerFeedback')}
              </Text>
            )}
          </View>

          {/* Right: Lock Controls Only (Language Toggle Removed) */}
          <View className="w-[220px] flex-row items-center justify-end">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setPinInput('');
                setPinError('');
                setPinModalVisible(true);
              }}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"
            >
              <Icon name="lock-outline" size={28} color="#475569" />
            </TouchableOpacity>
          </View>
        </View>

        {/* LOWER SECTION: Rating / Reasons / Thank You */}

        {/* Step: Main Rating Screen */}
        {step === 'rating' && (
          <View className="flex-1 justify-center py-4">
            {/* Above Row: 4-Column Grid directly matching the 4 Emoji Icon columns below */}
            <View className="flex-row items-end mb-6">
              {/* Column 1 (Directly above 1st Emoji 😍): Qatar Airways Logo */}
              <View className="flex-1 items-center justify-center">
                <Image
                  source={require('@/assets/images/qatar-airway-logo.png')}
                  style={{ width: 240, height: 105 }}
                  resizeMode="contain"
                />
              </View>

              {/* Column 2: Blank spacing above 2nd Emoji 😊 */}
              <View className="flex-1" />

              {/* Column 3: Blank spacing above 3rd Emoji 😐 */}
              <View className="flex-1" />

              {/* Column 4 (Directly above 4th Emoji 😞): Active Flight & Counter Info */}
              <View className="flex-1 items-center justify-center">
                <View className="items-center w-full gap-1.5">
                  {/* Flight Number & Route */}
                  <View className="items-center">
                    <Text className="text-4xl md:text-5xl font-black text-slate-900 text-center" style={{ lineHeight: 52 }}>
                      {flightNo}
                    </Text>
                    <Text className="text-2xl font-black text-[#17479E] text-center mt-1">
                      {route}
                    </Text>
                  </View>

                  {/* Time & Date Sub-Details (Time instead of counter name) */}
                  <View className="flex-row items-center justify-center gap-6 mt-3">
                    <Text className="text-3xl font-black text-slate-900">{flightTime}</Text>
                    <View className="h-7 w-[2.5px] bg-slate-300" />
                    <Text className="text-3xl font-black text-slate-900">{flightDate}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Rating Emoji Icons Row (Positioned lower near the bottom) */}
            <View className="flex-row items-center mt-32 md:mt-36 mb-2">
              {ratings.map((item, index) => (
                <FloatingEmoji
                  key={item.level}
                  emoji={item.emoji}
                  onPress={() => handleSelectRating(item.level)}
                  delay={index * 220}
                />
              ))}
            </View>
          </View>
        )}

        {/* Step: Reasons Selection (When rating is 1) */}
        {step === 'reasons' && (
          <View onTouchStart={resetReasonsTimer} className="flex-1 justify-center py-4">
            <View>
              <View className="mb-6">
                <Text className="text-3xl md:text-4xl font-black text-slate-900" style={{ lineHeight: 46 }}>
                  {t('whatToImprove')}
                </Text>
              </View>

              {/* Columns of 3 reasons each */}
              <View className="flex-row flex-wrap gap-5 mb-8">
                {(() => {
                  const cols: UnsatisfiedReason[][] = [];
                  for (let i = 0; i < apiReasons.length; i += 3) {
                    cols.push(apiReasons.slice(i, i + 3));
                  }
                  return cols.map((col, colIdx) => (
                    <View key={colIdx} className="flex-1 min-w-[280px] gap-4">
                      {col.map((reason) => (
                        <View key={reason.id} className="w-full">
                          <ReasonChip
                            label={reason.reasonName}
                            selected={selectedReasons.includes(reason.id)}
                            onPress={() => toggleReason(reason.id)}
                          />
                        </View>
                      ))}
                    </View>
                  ));
                })()}
              </View>

              {/* Submit Feedback Button spanning full width right below reason chips */}
              <View className="w-full mt-2">
                <AppButton title={t('submitFeedback')} onPress={() => handleSubmit()} />
              </View>
            </View>
          </View>
        )}

        {/* Step: Thank You */}
        {step === 'thankyou' && (
          <View className="flex-1 items-center justify-center py-10">
            <Text className="text-center mb-3" style={{ fontSize: 110, lineHeight: 125 }}>👨‍✈️👩‍✈️</Text>
            <Text className="text-4xl md:text-5xl font-black text-slate-900 text-center" style={{ lineHeight: 56 }}>
              {t('thankYou')}
            </Text>
            <Text className="text-xl font-bold text-slate-600 text-center mt-4 max-w-[680px]" style={{ lineHeight: 32 }}>
              {t('thankYouMessage')}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Admin PIN Authentication Modal */}
      <Modal visible={pinModalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center p-6" style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}>
          <View className="bg-white rounded-3xl p-8 w-full max-w-[460px] border border-slate-200" style={{ elevation: 10 }}>
            <Text className="text-2xl font-bold text-slate-900">{t('adminAuth')}</Text>
            <Text className="text-base text-slate-500 mt-1 mb-6">{t('enterPinDescription')}</Text>

            <TextInput
              secureTextEntry
              keyboardType="number-pad"
              value={pinInput}
              onChangeText={setPinInput}
              placeholder={t('enterPinPlaceholder')}
              textAlign="center"
              textAlignVertical="center"
              className="border border-slate-300 rounded-2xl p-5 bg-slate-50 text-slate-900 mb-2 text-2xl font-bold"
              style={{ textAlign: 'center' }}
            />
            {pinError ? <Text className="text-red-600 text-sm mb-4 text-center font-semibold">{pinError}</Text> : null}

            <View className="flex-row gap-4 mt-3">
              <View className="flex-1">
                <AppButton title={t('cancel')} onPress={() => setPinModalVisible(false)} variant="secondary" />
              </View>
              <View className="flex-1">
                <AppButton title={t('unlock')} onPress={handleAdminPinSubmit} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
