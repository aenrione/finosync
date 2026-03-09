/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "media",
  content: [
    "src/app/**/*.{tsx,jsx,ts,js}",
    "src/components/**/*.{tsx,jsx,ts,js}",
    "src/design-system/**/*.{tsx,jsx,ts,js}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // FinoSync Brand Colors — Indigo
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
          DEFAULT: '#4F46E5',
          foreground: '#FFFFFF',
          light: '#EEF2FF',
        },
        secondary: {
          DEFAULT: '#F1F5F9',
          foreground: '#334155',
        },

        // Semantic colors
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          dark: '#047857',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#D97706',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          dark: '#DC2626',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#DBEAFE',
          dark: '#1D4ED8',
        },

        // Financial-specific
        income: '#10B981',
        expense: '#EF4444',
        investment: '#8B5CF6',
        crypto: '#F59E0B',
        savings: '#06B6D4',

        // Account type accents
        'account-local': '#4F46E5',
        'account-fintoc': '#06B6D4',
        'account-fintual': '#8B5CF6',
        'account-buda': '#F59E0B',
        'account-local-light': '#EEF2FF',
        'account-fintoc-light': '#ECFEFF',
        'account-fintual-light': '#F5F3FF',
        'account-buda-light': '#FFFBEB',

        // UI surface colors
        background: '#FFFFFF',
        foreground: '#0F172A',
        surface: '#F8FAFC',
        border: '#E2E8F0',
        input: '#F8FAFC',
        ring: '#4F46E5',
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F1F5F9',
          foreground: '#64748B',
        },
        accent: {
          DEFAULT: '#EEF2FF',
          foreground: '#4F46E5',
        },
        card: {
          DEFAULT: '#F8FAFC',
          foreground: '#0F172A',
        },
      },
      
      fontFamily: {
        sans: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['IBM Plex Mono', 'SF Mono', 'Monaco', 'monospace'],
        // Keep roboto for backwards compatibility
        roboto: ["Roboto", "sans-serif"],
      },
      
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
        '5xl': ['48px', { lineHeight: '1' }],
      },
      
      fontWeight: {
        light: '300',
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        // Keep for compatibility
        extrablack: '950',
      },
      
      spacing: {
        0: '0',
        px: '1px',
        0.5: '2px',
        1: '4px',
        1.5: '6px',
        2: '8px',
        2.5: '10px',
        3: '12px',
        3.5: '14px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        9: '36px',
        10: '40px',
        11: '44px',
        12: '48px',
        14: '56px',
        16: '64px',
        20: '80px',
        24: '96px',
        28: '112px',
        32: '128px',
      },
      
      borderRadius: {
        none: '0',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
      },
      
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        md: '0 4px 8px 0 rgba(0, 0, 0, 0.12)',
        lg: '0 8px 16px 0 rgba(0, 0, 0, 0.15)',
        xl: '0 12px 24px 0 rgba(0, 0, 0, 0.18)',
      },
    },
  },
  plugins: [],
}
