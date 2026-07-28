import React from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppCard, MetricCard, SectionTitle, StatusBadge } from '@/components/ui';
import { getSummaryStats, mockEvaluations } from '@/services/mockData';
import { theme } from '@/theme';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isTablet = width / height >= 1.45;
  const stats = getSummaryStats();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.container, { paddingHorizontal: isTablet ? 32 : theme.spacing.lg, maxWidth: isTablet ? 980 : width }]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Operations dashboard</Text>
        <Text style={styles.subtitle}>Monitor evaluations and service quality.</Text>
      </View>

      <View style={styles.metricRow}>
        <MetricCard label="Total reviews" value={stats.total.toString()} accent={theme.colors.primary} />
        <MetricCard label="Excellent" value={stats.excellent.toString()} accent={theme.colors.success} />
      </View>
      <View style={styles.metricRow}>
        <MetricCard label="Avg rating" value={stats.average.toString()} accent={theme.colors.warning} />
        <MetricCard label="Counter" value="3 active" accent={theme.colors.accent} />
      </View>

      <SectionTitle title="Recent evaluations" subtitle="Latest guest feedback collected by staff." />
      {mockEvaluations.map((item) => (
        <AppCard key={item.id} style={styles.evaluationCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.flightName}>{item.flightNo}</Text>
            <StatusBadge label={`${item.rating}/4`} color={item.rating >= 4 ? theme.colors.success : theme.colors.warning} />
          </View>
          <Text style={styles.meta}>{item.counter} • {item.createdAt}</Text>
          <Text style={styles.comment}>{item.comment}</Text>
        </AppCard>
      ))}

      <AppButton title="Manage staff accounts" onPress={() => router.push('/admin/staff' as never)} />
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
  metricRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  evaluationCard: {
    marginBottom: theme.spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flightName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  meta: {
    color: theme.colors.muted,
    marginTop: 6,
  },
  comment: {
    color: theme.colors.text,
    marginTop: 8,
  },
});
