import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@/theme';

export type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
};

export function AppButton({ title, onPress, variant = 'primary', fullWidth = true }: AppButtonProps) {
  const backgroundColor =
    variant === 'secondary'
      ? theme.colors.surface
      : variant === 'ghost'
        ? theme.colors.white
        : theme.colors.primary;

  const textColor = variant === 'primary' ? theme.colors.white : theme.colors.text;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.button, { backgroundColor, width: fullWidth ? '100%' : 'auto' }]}
    >
      <Text selectable style={[styles.buttonText, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function AppCard({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text selectable style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text selectable style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function MetricCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View style={[styles.metricCard, accent ? { borderColor: accent } : null]}>
      <Text selectable style={styles.metricLabel}>{label}</Text>
      <Text selectable style={styles.metricValue}>{value}</Text>
    </View>
  );
}

export function StatusBadge({ label, color }: { label: string; color?: string }) {
  return (
    <View style={[styles.badge, color ? { backgroundColor: color } : null]}>
      <Text selectable style={styles.badgeText}>{label}</Text>
    </View>
  );
}

export function RatingOption({ label, emoji, selected, onPress }: { label: string; emoji: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.ratingOption, selected ? styles.selectedRating : null]}
    >
      <Text selectable style={styles.ratingEmoji}>{emoji}</Text>
      <Text selectable style={styles.ratingLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export function ReasonChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.reasonChip, selected ? styles.selectedReason : null]}>
      <Text selectable style={[styles.reasonText, selected ? styles.selectedReasonText : null]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
    boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)',
  },
  sectionTitleRow: {
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: theme.colors.muted,
    marginTop: 4,
  },
  metricCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flex: 1,
    minHeight: 92,
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.muted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  ratingOption: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: theme.colors.white,
    minHeight: 116,
    justifyContent: 'center',
  },
  selectedRating: {
    borderColor: theme.colors.primary,
    backgroundColor: '#ecfeff',
  },
  ratingEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  ratingLabel: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
  reasonChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: theme.colors.white,
  },
  selectedReason: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  reasonText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  selectedReasonText: {
    color: theme.colors.white,
  },
});
