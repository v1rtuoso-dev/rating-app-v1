import { Platform } from 'react-native';
import { Color } from 'expo-router';

export const colors = {
  label: Platform.select({
    ios: Color.ios.label,
    android: Color.android.dynamic.onSurface,
    default: '#0f172a',
  })!,
  secondaryLabel: Platform.select({
    ios: Color.ios.secondaryLabel,
    android: Color.android.dynamic.onSurfaceVariant,
    default: '#475569',
  })!,
  separator: Platform.select({
    ios: Color.ios.separator,
    android: Color.android.dynamic.outlineVariant,
    default: '#e2e8f0',
  })!,
  systemBackground: Platform.select({
    ios: Color.ios.systemBackground,
    android: Color.android.dynamic.surface,
    default: '#f4f7fb',
  })!,
  secondarySystemBackground: Platform.select({
    ios: Color.ios.secondarySystemBackground,
    android: Color.android.dynamic.surface,
    default: '#ffffff',
  })!,
  systemBlue: Platform.select({
    ios: Color.ios.systemBlue,
    android: Color.android.dynamic.primary,
    default: '#2563eb',
  })!,
  systemGreen: Platform.select({
    ios: Color.ios.systemGreen,
    android: Color.android.dynamic.tertiary,
    default: '#16a34a',
  })!,
  systemOrange: Platform.select({
    ios: Color.ios.systemOrange,
    android: Color.android.dynamic.secondary,
    default: '#f59e0b',
  })!,
  systemRed: Platform.select({
    ios: Color.ios.systemRed,
    android: Color.android.dynamic.error,
    default: '#dc2626',
  })!,
};
