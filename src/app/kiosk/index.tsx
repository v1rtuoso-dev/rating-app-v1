import React, { useEffect, useState } from 'react';
import { Modal, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppCard, RatingOption, ReasonChip, SectionTitle } from '@/components/ui';
import { useSession } from '@/features/session/SessionContext';
import { CreateEvaluationPayload, evaluationsApi } from '@/services/api/evaluationsApi';
import { flightApi } from '@/services/api/flightApi';
import { reasonsApi, UnsatisfiedReason } from '@/services/api/reasonsApi';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from '@/tw';

type Step = 'rating' | 'reasons' | 'comment' | 'thankyou';

const ratings = [
  { level: 4, label: 'Very Satisfied', emoji: '😍' },
  { level: 3, label: 'Satisfied', emoji: '😊' },
  { level: 2, label: 'Unsatisfied', emoji: '😐' },
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
  const [comment, setComment] = useState('');
  const [apiReasons, setApiReasons] = useState<UnsatisfiedReason[]>([]);
  const [activeFlightId, setActiveFlightId] = useState<number | null>(session?.flightId ?? null);

  // Admin PIN Popup State
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Fetch reasons and ensure valid active flightId
  useEffect(() => {
    (async () => {
      try {
        const fetchedReasons = await reasonsApi.getReasons();
        setApiReasons(fetchedReasons);

        if (session?.flightId) {
          setActiveFlightId(session.flightId);
        } else {
          const fetchedFlights = await flightApi.searchFlights();
          if (fetchedFlights.length > 0) {
            const realId = fetchedFlights[0].flightId || fetchedFlights[0].id || 101;
            setActiveFlightId(realId);
          } else {
            setActiveFlightId(101);
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
    setComment('');
    setStep('rating');
  };

  const handleSelectRating = (level: number) => {
    setSelectedRating(level);
    if (level <= 2) {
      setStep('reasons');
    } else {
      setStep('comment');
    }
  };

  const toggleReason = (id: number) => {
    setSelectedReasons((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    const flightIdToSubmit = session?.flightId || activeFlightId || 101;
    const deviceIdToSubmit = session?.deviceId || currentDevice?.id || 1;

    const payload: CreateEvaluationPayload = {
      flightId: flightIdToSubmit,
      deviceId: deviceIdToSubmit,
      rating: selectedRating || 4,
      comment: comment.trim() ? comment.trim() : undefined,
      reasonIds: selectedReasons,
    };

    console.log('Submitting evaluation payload to API:', payload);

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
      setPinError('Invalid Admin PIN. (Default: 123456)');
    }
  };

  return (
    <View className="flex-1 bg-slate-100">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 bg-slate-100"
        contentContainerClassName={`flex-grow pt-8 pb-28 w-full self-center justify-center ${
          isLandscape ? 'px-10 max-w-[1280px]' : 'px-6'
        }`}
      >
        {/* Header with hidden/discrete Admin button */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-3xl font-black text-slate-900" style={{ lineHeight: 40 }}>Passenger Feedback</Text>
            <Text className="text-base font-bold text-teal-800 mt-1" style={{ lineHeight: 22 }}>
              Flight {session?.flightNo || 'VN210'} • {session?.counter || 'Counter A'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setPinInput('');
              setPinError('');
              setPinModalVisible(true);
            }}
            className="py-3 px-5 rounded-2xl bg-white border border-slate-300 shadow-sm flex-row items-center"
          >
            <Text className="text-sm text-slate-800 font-bold">🔒 Admin</Text>
          </TouchableOpacity>
        </View>

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
              subtitle="Select any reasons that impacted your check-in experience."
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
                <AppButton title="Continue" onPress={() => setStep('comment')} />
              </View>
            </View>
          </AppCard>
        )}

        {step === 'comment' && (
          <AppCard>
            <SectionTitle
              title="Additional feedback (optional)"
              subtitle="Share any specific details or staff compliments."
            />
            <TextInput
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
              placeholder="Type your feedback here..."
              className="border border-slate-200 rounded-2xl p-5 bg-slate-50 text-slate-900 text-lg min-h-[160px] mt-4"
              style={{ textAlignVertical: 'top' }}
            />

            <View className="mt-8 flex-row gap-4">
              <View className="flex-1">
                <AppButton
                  title="Back"
                  onPress={() => setStep(selectedRating && selectedRating <= 2 ? 'reasons' : 'rating')}
                  variant="secondary"
                />
              </View>
              <View className="flex-1">
                <AppButton title="Submit Feedback" onPress={handleSubmit} />
              </View>
            </View>
          </AppCard>
        )}

        {step === 'thankyou' && (
          <AppCard className="items-center py-12">
            <Text className="text-center mb-4" style={{ fontSize: 72, lineHeight: 84 }}>🎉</Text>
            <Text className="text-4xl font-black text-slate-900 text-center" style={{ lineHeight: 48 }}>Thank You!</Text>
            <Text className="text-lg text-slate-500 text-center mt-3 max-w-[560px]" style={{ lineHeight: 26 }}>
              Your feedback helps us continuously elevate our service quality. Have a safe and pleasant flight!
            </Text>

            <View className="mt-10 w-full max-w-[400px]">
              <AppButton title="Submit Another Rating" onPress={resetForm} />
            </View>
          </AppCard>
        )}
      </ScrollView>

      {/* Admin PIN Authentication Modal */}
      <Modal visible={pinModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-slate-900/60 justify-center items-center p-6">
          <View className="bg-white rounded-3xl p-8 w-full max-w-[460px] border border-slate-200 shadow-2xl">
            <Text className="text-2xl font-bold text-slate-900">Admin Authentication</Text>
            <Text className="text-base text-slate-500 mt-1 mb-6">Enter Admin PIN/Password to access settings.</Text>

            <TextInput
              secureTextEntry
              keyboardType="number-pad"
              value={pinInput}
              onChangeText={setPinInput}
              placeholder="Enter PIN (Default: 123456)"
              className="border border-slate-300 rounded-2xl p-5 bg-slate-50 text-slate-900 mb-2 text-center text-2xl font-bold tracking-widest"
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
