import React from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppCard, SectionTitle, StatusBadge } from '@/components/ui';
import { theme } from '@/theme';

const staffMembers = [
  { id: 1, name: 'Linh Tran', role: 'Agent', status: 'Active' },
  { id: 2, name: 'Minh Nguyen', role: 'Supervisor', status: 'Active' },
  { id: 3, name: 'Hoa Le', role: 'Agent', status: 'Pending' },
];

export default function StaffScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isTablet = width / height >= 1.45;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.container, { paddingHorizontal: isTablet ? 32 : theme.spacing.lg, maxWidth: isTablet ? 980 : width }]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Staff accounts</Text>
        <Text style={styles.subtitle}>Manage staff access and roles.</Text>
      </View>

      <SectionTitle title="Users" subtitle="Role-based access can be configured here." />
      {staffMembers.map((person) => (
        <AppCard key={person.id} style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.name}>{person.name}</Text>
            <StatusBadge label={person.status} color={person.status === 'Active' ? theme.colors.success : theme.colors.warning} />
          </View>
          <Text style={styles.role}>{person.role}</Text>
        </AppCard>
      ))}

      <AppButton title="Back to dashboard" onPress={() => router.push('/admin/dashboard' as never)} />
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
  card: {
    marginBottom: theme.spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  role: {
    color: theme.colors.muted,
    marginTop: 6,
  },
});
