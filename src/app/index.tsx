import React from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppCard, SectionTitle } from '@/components/ui';
import { theme } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.container, { paddingHorizontal: isLandscape ? 28 : 20, paddingVertical: isLandscape ? 20 : 24 }]}
    >
      <View style={[styles.heroRow, isLandscape && styles.heroRowLandscape]}>
        <View style={styles.heroPanel}>
          <Text style={styles.title}>Customer feedback system</Text>
          <Text style={styles.subtitle}>A full-screen experience for guest kiosks and internal staff.</Text>
        </View>

        <View style={styles.actionsColumn}>
          <AppCard style={styles.card}>
            <SectionTitle title="Choose entry point" subtitle="Launch the dedicated workflow for each audience." />
            <AppButton title="Open kiosk mode" onPress={() => router.push('/kiosk' as never)} />
            <AppButton title="Open admin mode" onPress={() => router.push('/admin' as never)} variant="secondary" />
          </AppCard>

          <AppCard style={styles.card}>
            <SectionTitle title="Included flows" subtitle="Built for quick interaction on a landscape tablet." />
            <Text style={styles.listItem}>• Guest rating and feedback</Text>
            <Text style={styles.listItem}>• Unsatisfied reasons and comments</Text>
            <Text style={styles.listItem}>• Admin login and dashboard</Text>
            <Text style={styles.listItem}>• Staff account overview</Text>
          </AppCard>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    width: '100%',
    alignSelf: 'center',
  },
  heroRow: {
    width: '100%',
    gap: theme.spacing.md,
  },
  heroRowLandscape: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  heroPanel: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 220,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.muted,
    marginTop: 8,
  },
  actionsColumn: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  card: {
    marginBottom: 0,
  },
  listItem: {
    color: theme.colors.muted,
    marginBottom: 6,
    fontSize: 14,
  },
});
