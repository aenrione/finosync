/**
 * Resolved color values from tailwind.config.js tokens.
 *
 * Use these ONLY when a React Native prop requires a raw color string
 * (e.g. placeholderTextColor, tintColor, backgroundColor on third-party components).
 * For all other cases, use Tailwind className tokens instead.
 */
export const colors = {
  primary: '#4F46E5',
  primaryLight: '#EEF2FF',
  secondary: '#F1F5F9',
  foreground: '#0F172A',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  border: '#E2E8F0',
  input: '#F8FAFC',
  muted: '#F1F5F9',
  mutedForeground: '#64748B',
  card: '#F8FAFC',
  cardForeground: '#0F172A',

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  destructive: '#EF4444',

  // Financial
  income: '#10B981',
  expense: '#EF4444',
  investment: '#8B5CF6',
  crypto: '#F59E0B',
  savings: '#06B6D4',

  // Account type accents
  accountLocal: '#4F46E5',
  accountFintoc: '#06B6D4',
  accountFintual: '#8B5CF6',
  accountBuda: '#F59E0B',

  // Neutral scale (Slate)
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },

  // Chart-specific (for currency differentiation)
  chart: {
    blue: '#2563EB',
    green: '#059669',
    purple: '#7C3AED',
    red: '#DC2626',
    amber: '#F59E0B',
    cyan: '#06B6D4',
  },
} as const;
