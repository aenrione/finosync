/**
 * Resolved color values from tailwind.config.js tokens.
 *
 * Use these ONLY when a React Native prop requires a raw color string
 * (e.g. placeholderTextColor, tintColor, backgroundColor on third-party components).
 * For all other cases, use Tailwind className tokens instead.
 */
export const colors = {
  primary: '#1abdbd',
  secondary: '#ffc71a',
  foreground: '#1a1a1a',
  background: '#ffffff',
  border: '#e0e0e0',
  input: '#f5f5f5',
  muted: '#f5f5f5',
  mutedForeground: '#616161',
  card: '#ffffff',
  cardForeground: '#1a1a1a',

  // Semantic
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  destructive: '#ef4444',

  // Financial
  income: '#10b981',
  expense: '#ef4444',
  investment: '#8b5cf6',
  crypto: '#f59e0b',
  savings: '#06b6d4',

  // Neutral scale
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#2a2a2a',
    950: '#1a1a1a',
  },

  // Chart-specific (for currency differentiation)
  chart: {
    blue: '#2563EB',
    green: '#059669',
    purple: '#7C3AED',
    red: '#DC2626',
    amber: '#f59e0b',
    cyan: '#06b6d4',
  },
} as const;
