import { colors as semanticColors } from './colors';

export const theme = {
  colors: {
    primary: '#0f766e',
    primaryDark: '#115e59',
    accent: '#2563eb',
    warning: '#f59e0b',
    success: '#16a34a',
    danger: '#dc2626',
    text: semanticColors.label as string,
    muted: semanticColors.secondaryLabel as string,
    border: semanticColors.separator as string,
    surface: semanticColors.secondarySystemBackground as string,
    white: '#ffffff',
    background: semanticColors.systemBackground as string,
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 10,
    md: 16,
    lg: 24,
  },
} as const;
