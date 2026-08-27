import { colors as semanticColors } from './colors';
import { typography } from './typography';

export const theme = {
  typography,
  colors: {
    primary: '#1E4CA1',
    primaryDark: '#143675',
    accent: '#FF8947',
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

export * from './typography';
