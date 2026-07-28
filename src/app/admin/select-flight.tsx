import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppCard, SectionTitle, StatusBadge } from '@/components/ui';
import { mockFlights } from '@/services/mockData';
import { theme } from '@/theme';
import { ScrollView, Text, View } from '@/tw';

export default function SelectFlightScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isTablet = width / height >= 1.45;
  const [selectedFlightId, setSelectedFlightId] = useState<number | null>(mockFlights[0]?.id ?? null);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 bg-slate-100"
      contentContainerClassName={`flex-grow py-6 w-full self-center ${isTablet ? 'px-8 max-w-[980px]' : 'px-6'}`}
    >
      <View className="mb-4">
        <Text className="text-3xl font-extrabold text-slate-900">Active service session</Text>
        <Text className="text-sm text-slate-500 mt-1.5">Choose flight and counter before starting work.</Text>
      </View>

      <SectionTitle title="Available flights" subtitle="Select the flight that is currently being served." />
      {mockFlights.map((flight) => {
        const selected = selectedFlightId === flight.id;

        return (
          <AppCard key={flight.id} className={`mb-3 ${selected ? 'border-teal-700' : ''}`}>
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-lg font-bold text-slate-900">{flight.flightNo}</Text>
                <Text className="text-slate-500 text-sm mt-1">{flight.route}</Text>
              </View>
              <StatusBadge label={flight.status} color={selected ? theme.colors.primary : theme.colors.warning} />
            </View>
            <Text className="mt-2.5 mb-3 text-slate-500 text-sm">{flight.flightDate} • {flight.flightTime}</Text>
            <AppButton
              title={selected ? 'Selected' : 'Choose flight'}
              onPress={() => setSelectedFlightId(flight.id)}
              variant={selected ? 'primary' : 'secondary'}
            />
          </AppCard>
        );
      })}

      <AppButton title="Continue to dashboard" onPress={() => router.push('/admin/dashboard' as never)} />
      <AppButton title="Back" onPress={() => router.back()} variant="secondary" />
    </ScrollView>
  );
}

