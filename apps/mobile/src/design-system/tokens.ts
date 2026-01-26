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
  // Primary: Teal (Trust + Growth + Finance)
  // Represents financial security, growth, and forward movement
  primary: {
    50: '#e6f7f7',
    100: '#b3e9e9',
    200: '#80dada',
    300: '#4dcccc',
    400: '#1abdbd',  // Main brand color
    500: '#15a3a3',
    600: '#108a8a',
    700: '#0c7070',
    800: '#075757',
    900: '#033d3d',
    950: '#012828',
  },
  
  // Secondary: Amber (Warmth + Action)
  // For CTAs, highlights, and energy
  secondary: {
    50: '#fff8e6',
    100: '#ffedb3',
    200: '#ffe080',
    300: '#ffd44d',
    400: '#ffc71a',
    500: '#e6b010',
    600: '#cc9c0c',
    700: '#b38707',
    800: '#997303',
    900: '#805e00',
    950: '#664b00',
  },
  
  // Neutrals: Clean grays (Clarity)
  // Inspired by Fintoc's Cyberspace/Silver/Network
  neutral: {
    0: '#ffffff',    // Pure white
    50: '#fafafa',   // Almost white
    100: '#f5f5f5',  // Very light gray
    200: '#eeeeee',  // Light gray
    300: '#e0e0e0',  // Medium-light gray
    400: '#bdbdbd',  // Medium gray
    500: '#9e9e9e',  // Neutral gray
    600: '#757575',  // Medium-dark gray
    700: '#616161',  // Dark gray
    800: '#424242',  // Very dark gray
    900: '#2a2a2a',  // Almost black
    950: '#1a1a1a',  // Near black
    1000: '#000000', // Pure black
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
    primary: '#ffffff',
    secondary: '#fafafa',
    tertiary: '#f5f5f5',
  },
  border: {
    light: '#e0e0e0',
    DEFAULT: '#bdbdbd',
    dark: '#757575',
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
