import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppCard, SectionTitle, StatusBadge } from '@/components/ui';
import { mockFlights } from '@/services/mockData';
import { theme } from '@/theme';

export default function SelectFlightScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isTablet = width / height >= 1.45;
  const [selectedFlightId, setSelectedFlightId] = useState<number | null>(mockFlights[0]?.id ?? null);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.container, { paddingHorizontal: isTablet ? 32 : theme.spacing.lg, maxWidth: isTablet ? 980 : width }]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Active service session</Text>
        <Text style={styles.subtitle}>Choose flight and counter before starting work.</Text>
      </View>

      <SectionTitle title="Available flights" subtitle="Select the flight that is currently being served." />
      {mockFlights.map((flight) => {
        const selected = selectedFlightId === flight.id;

        return (
          <AppCard key={flight.id} style={[styles.flightCard, selected ? styles.selectedFlightCard : null]}>
            <View style={styles.flightHeader}>
              <View>
                <Text style={styles.flightNo}>{flight.flightNo}</Text>
                <Text style={styles.flightRoute}>{flight.route}</Text>
              </View>
              <StatusBadge label={flight.status} color={selected ? theme.colors.primary : theme.colors.warning} />
            </View>
            <Text style={styles.flightTime}>{flight.flightDate} • {flight.flightTime}</Text>
            <AppButton title={selected ? 'Selected' : 'Choose flight'} onPress={() => setSelectedFlightId(flight.id)} variant={selected ? 'primary' : 'secondary'} />
          </AppCard>
        );
      })}

      <AppButton title="Continue to dashboard" onPress={() => router.push('/admin/dashboard' as never)} />
      <AppButton title="Back" onPress={() => router.back()} variant="secondary" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.lg,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.muted,
    marginTop: 6,
  },
  flightCard: {
    marginBottom: theme.spacing.sm,
  },
  selectedFlightCard: {
    borderColor: theme.colors.primary,
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flightNo: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  flightRoute: {
    color: theme.colors.muted,
    marginTop: 4,
  },
  flightTime: {
    marginTop: 10,
    color: theme.colors.muted,
  },
});
