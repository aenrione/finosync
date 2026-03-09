/**
 * FinoSync Design System Tokens
 * 
 * These tokens define the visual language of FinoSync.
 * Inspired by Fintoc's clean, modern aesthetic but with our own identity.
 * 
 * Philosophy:
 * - Trust & Clarity: Financial apps need to feel secure and transparent
 * - Simplicity: Clean, uncluttered interfaces
 * - Energy: Vibrant but not overwhelming
 */

export const colors = {
  // Primary: Indigo (Trust + Premium + Finance)
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',   // Main brand color
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
    950: '#1E1B4B',
  },

  // Secondary: Slate (Neutral surface)
  secondary: {
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

  // Neutrals: Slate scale
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
  
  // Semantic Colors
  success: {
    DEFAULT: '#10b981', // Green
    light: '#d1fae5',
    dark: '#047857',
  },
  warning: {
    DEFAULT: '#f59e0b', // Orange
    light: '#fef3c7',
    dark: '#d97706',
  },
  error: {
    DEFAULT: '#ef4444', // Red
    light: '#fee2e2',
    dark: '#dc2626',
  },
  info: {
    DEFAULT: '#3b82f6', // Blue
    light: '#dbeafe',
    dark: '#1d4ed8',
  },
  
  // Financial-specific colors
  income: '#10b981',      // Green (positive)
  expense: '#ef4444',     // Red (negative)
  investment: '#8b5cf6',  // Purple (growth)
  crypto: '#f59e0b',      // Orange (volatile)
  savings: '#06b6d4',     // Cyan (liquid)
  
  // UI Element colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
  },
  border: {
    light: '#E2E8F0',
    DEFAULT: '#CBD5E1',
    dark: '#94A3B8',
  },
};

export const typography = {
  fontFamily: {
    // DM Sans: Clean, modern, geometric (like Fintoc)
    // Free from Google Fonts
    sans: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
    
    // For numbers and monospace needs
    mono: ['IBM Plex Mono', 'SF Mono', 'Monaco', 'monospace'],
  },
  
  fontSize: {
    '2xs': { size: 10, lineHeight: 14 },
    'xs': { size: 12, lineHeight: 16 },
    'sm': { size: 14, lineHeight: 20 },
    'base': { size: 16, lineHeight: 24 },
    'lg': { size: 18, lineHeight: 28 },
    'xl': { size: 20, lineHeight: 28 },
    '2xl': { size: 24, lineHeight: 32 },
    '3xl': { size: 30, lineHeight: 36 },
    '4xl': { size: 36, lineHeight: 40 },
    '5xl': { size: 48, lineHeight: 1 },
  },
  
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const spacing = {
  // Base unit: 4px
  0: 0,
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  DEFAULT: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  // Inspired by Fintoc's hard/soft shadow system
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  DEFAULT: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 5,
  },
};

export const transitions = {
  fast: 150,
  DEFAULT: 200,
  slow: 300,
};

// Component-specific tokens
export const components = {
  button: {
    height: {
      sm: 32,
      md: 40,
      lg: 48,
    },
    paddingX: {
      sm: 12,
      md: 16,
      lg: 24,
    },
  },
  input: {
    height: {
      sm: 36,
      md: 44,
      lg: 52,
    },
    paddingX: 12,
  },
  card: {
    padding: 16,
    borderRadius: borderRadius.DEFAULT,
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  components,
};
